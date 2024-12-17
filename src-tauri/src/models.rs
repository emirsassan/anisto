use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FileAttributes {
    pub lipsync: Option<bool>,
    pub confidant_point: Option<bool>,
    pub box_type: Option<String>,
    pub confidant_id: Option<i32>,
    pub points_gained: Option<i32>,
    pub model_id: Option<i32>,
    pub character_name: Option<String>,
    pub character_checkbox: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct File {
    pub id: String,
    pub name: String,
    pub text: String,
    pub output: Option<String>,
    pub attributes: Option<FileAttributes>,
}

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub files: Vec<File>,
} 

#[derive(Serialize, Deserialize)]
pub struct MessageAttributes {
    pub has_lipsync: bool,
    pub wait_for_input: bool
}

#[derive(Serialize, Deserialize)]
pub struct SerializableMessage {
    pub content: String,
    pub attributes: MessageAttributes,
}
