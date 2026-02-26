#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        // 🚀 LIGA O PLUGIN DE PROCESSOS (Para reiniciar o app)
        .plugin(tauri_plugin_process::init()) 
        // 🚀 LIGA O PLUGIN DO UPDATER (Para baixar a nova versão)
        .plugin(tauri_plugin_updater::Builder::new().build()) 
        .setup(|app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}