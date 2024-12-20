// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use dirs;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use std::fs;
use std::process::{Command, Stdio};
use tauri::path::BaseDirectory;

#[derive(Serialize, Deserialize)]
struct FileAttributes {
    lipsync: Option<bool>,
    confidantPoint: Option<bool>,
    boxType: Option<String>,
    confidantId: Option<i32>,
    pointsGained: Option<i32>,
    modelId: Option<i32>,
    characterName: Option<String>,
    characterCheckbox: Option<bool>,
}

#[derive(Serialize, Deserialize)]
struct File {
    id: String,
    name: String,
    text: String,
    output: Option<String>,
    attributes: Option<FileAttributes>,
}

#[derive(Serialize, Deserialize)]
struct Project {
    id: String,
    name: String,
    description: Option<String>,
    created_at: String,
    updated_at: String,
    files: Vec<File>,
}

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
    let resource_path = handle.path().resolve("atlus-compiler/AtlusScriptCompiler.exe", BaseDirectory::Resource).unwrap();

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
            compile_msg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
