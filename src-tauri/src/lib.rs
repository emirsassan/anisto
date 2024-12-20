// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod models;
mod settings;

use dirs;
use models::Project;
use std::fs;
use std::process::{Command, Stdio};
use tauri::path::BaseDirectory;
use tauri::Manager;

#[tauri::command]
async fn save_project(project: Project) -> Result<(), String> {
    let app_dir = dirs::config_dir().ok_or("Failed to get app directory")?;

    let projects_dir = app_dir.join("projects");
    fs::create_dir_all(&projects_dir).map_err(|e| e.to_string())?;

    let file_path = projects_dir.join(format!("{}.json", project.id));
    let content = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;

    fs::write(file_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn load_projects() -> Result<Vec<Project>, String> {
    let app_dir = dirs::config_dir().ok_or("Failed to get app directory")?;

    let projects_dir = app_dir.join("projects");
    if !projects_dir.exists() {
        return Ok(Vec::new());
    }

    let mut projects = Vec::new();
    let entries = fs::read_dir(projects_dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        if entry.path().extension().and_then(|s| s.to_str()) == Some("json") {
            let content = fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
            let project: Project = serde_json::from_str(&content).map_err(|e| e.to_string())?;
            projects.push(project);
        }
    }

    Ok(projects)
}

#[tauri::command]
async fn delete_project(project_id: String) -> Result<(), String> {
    let app_dir = dirs::config_dir().ok_or("Failed to get app directory")?;
    let projects_dir = app_dir.join("projects");
    let file_path = projects_dir.join(format!("{}.json", project_id));

    if !file_path.exists() {
        return Err("Project file does not exist".to_string());
    }

    fs::remove_file(file_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn update_project(project: Project) -> Result<(), String> {
    let app_dir = dirs::config_dir().ok_or("Failed to get app directory")?;
    let projects_dir = app_dir.join("projects");
    let file_path = projects_dir.join(format!("{}.json", project.id));

    let content = serde_json::to_string_pretty(&project).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn export_project(project_id: String, output_path: String) -> Result<(), String> {
    let projects = load_projects().await?;
    let project = projects
        .iter()
        .find(|p| p.id == project_id)
        .ok_or("Project not found")?;

    let mut output_content = String::new();
    for file in &project.files {
        if let Some(output) = &file.output {
            output_content.push_str(output);
            output_content.push('\n');
            output_content.push('\n');
        }
    }

    fs::write(output_path, output_content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_app_data_dir() -> Result<String, String> {
    let app_dir = dirs::config_dir().ok_or("Failed to get app directory")?;
    Ok(app_dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn compile_msg(handle: tauri::AppHandle, msg_path: String) -> Result<(), String> {
    let resource_path = handle
        .path()
        .resolve(
            "atlus-compiler/AtlusScriptCompiler.exe",
            BaseDirectory::Resource,
        )
        .unwrap();

    let output = Command::new(resource_path)
        //.arg(format!("{} -Compile -OutFormat V1BE -Library P5R -Encoding P5R_EFIGS -Hook -SumBits", msg_path))
        .arg(msg_path)
        .arg("-Compile")
        .arg("-OutFormat")
        .arg("V1BE")
        .arg("-Library")
        .arg("P5R")
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err("Failed to compile".to_string())
    }
}

#[tauri::command]
async fn test_compiler(handle: tauri::AppHandle) -> Result<String, String> {
    let resource_path = handle
        .path()
        .resolve(
            "atlus-compiler/AtlusScriptCompiler.exe",
            BaseDirectory::Resource,
        )
        .unwrap();
    let test_script = handle
        .path()
        .resolve("tests/test.msg", BaseDirectory::Resource)
        .unwrap();

    let output = Command::new(resource_path)
        .arg(test_script)
        .arg("-Compile")
        .arg("-OutFormat")
        .arg("V1BE")
        .arg("-Library")
        .arg("P5R")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        // Replace any invalid characters that could break JSON parsing
        let cleaned = stdout
            .replace('\u{0}', "")
            .replace('\u{001b}', "")
            .replace('\r', "");
        Ok(cleaned)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let cleaned = stderr
            .replace('\u{0}', "")
            .replace('\u{001b}', "")
            .replace('\r', "");
        Err(cleaned)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_project,
            load_projects,
            delete_project,
            update_project,
            get_app_data_dir,
            export_project,
            compile_msg,
            test_compiler,
            settings::get_setting,
            settings::set_boolean_setting,
            settings::set_integer_setting,
            settings::set_string_setting,
            settings::get_all_settings,
            settings::remove_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
