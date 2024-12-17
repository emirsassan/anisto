use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use dirs;

// Simple value enum without untagged attribute
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SettingValue {
    String(String),
    Integer(i64),
    Boolean(bool),
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Settings {
    values: HashMap<String, SettingValue>,
}

impl Settings {
    pub fn new() -> Self {
        Settings {
            values: HashMap::new(),
        }
    }

    fn get_settings_file_path() -> Result<PathBuf, String> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| "Failed to get config directory".to_string())?;
        Ok(config_dir.join("anisto/settings.json"))
    }

    pub fn load() -> Result<Self, String> {
        let path = Self::get_settings_file_path()?;
        
        if !path.exists() {
            return Ok(Settings::new());
        }

        let content = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;
            
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::get_settings_file_path()?;
        
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create settings directory: {}", e))?;
        }

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;
            
        fs::write(&path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))
    }
}

#[tauri::command]
pub async fn get_setting(key: String) -> Result<Option<SettingValue>, String> {
    let settings = Settings::load()?;
    Ok(settings.values.get(&key).cloned())
}

#[tauri::command]
pub async fn set_string_setting(key: String, value: String) -> Result<(), String> {
    let mut settings = Settings::load()?;
    settings.values.insert(key, SettingValue::String(value));
    settings.save()
}

#[tauri::command]
pub async fn set_integer_setting(key: String, value: i64) -> Result<(), String> {
    let mut settings = Settings::load()?;
    settings.values.insert(key, SettingValue::Integer(value));
    settings.save()
}

#[tauri::command]
pub async fn set_boolean_setting(key: String, value: bool) -> Result<(), String> {
    let mut settings = Settings::load()?;
    settings.values.insert(key, SettingValue::Boolean(value));
    settings.save()
}

#[tauri::command]
pub async fn get_all_settings() -> Result<HashMap<String, SettingValue>, String> {
    let settings = Settings::load()?;
    Ok(settings.values)
}

#[tauri::command]
pub async fn remove_setting(key: String) -> Result<(), String> {
    let mut settings = Settings::load()?;
    settings.values.remove(&key);
    settings.save()
}
