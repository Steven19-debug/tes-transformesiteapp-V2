import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [buildType, setBuildType] = useState('apk');
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Déclenche le workflow GitHub
  const triggerWorkflow = async () => {
    if (!repoUrl) return Alert.alert("Erreur", "Coller l'URL du dépôt GitHub !");

    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return Alert.alert("Erreur", "URL GitHub invalide !");
      const owner = match[1];
      const repo = match[2];

      setLoading(true);

      // 1️⃣ Déclencher le workflow
      await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `token ${YOUR_GITHUB_TOKEN}`, // → côté serveur ou secret GitHub
        },
        body: JSON.stringify({
          ref: "main",
          inputs: { buildType }
        })
      });

      Alert.alert("Info", "Build déclenché ! Attendre quelques minutes...");

      // 2️⃣ Vérifier régulièrement le statut du dernier workflow
      const pollWorkflow = async () => {
        const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/build-apk.yml/runs?branch=main&per_page=1`, {
          headers: { "Authorization": `token ${YOUR_GITHUB_TOKEN}` }
        });
        const data = await resp.json();
        const run = data.workflow_runs?.[0];

        if (!run) return;

        if (run.status === 'completed') {
          const artifactResp = await fetch(run.artifacts_url, {
            headers: { "Authorization": `token ${YOUR_GITHUB_TOKEN}` }
          });
          const artifacts = await artifactResp.json();
          const artifact = artifacts.artifacts?.[0];
          if (artifact) {
            setDownloadLink(`https://nightly.link/${owner}/${repo}/actions/artifacts/${artifact.id}.zip`);
          }
          setLoading(false);
        } else {
          // Réessayer dans 10s
          setTimeout(pollWorkflow, 10000);
        }
      };

      pollWorkflow();

    } catch (err) {
      setLoading(false);
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Build GitHub → APK/AAB</Text>

      <TextInput
        style={styles.input}
        placeholder="https://github.com/USER/REPO"
        value={repoUrl}
        onChangeText={setRepoUrl}
        autoCapitalize="none"
      />

      <View style={styles.buildTypeRow}>
        <TouchableOpacity
          style={[styles.buildTypeButton, buildType === "apk" && styles.activeButton]}
          onPress={() => setBuildType("apk")}
        >
          <Text style={styles.buttonText}>APK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buildTypeButton, buildType === "aab" && styles.activeButton]}
          onPress={() => setBuildType("aab")}
        >
          <Text style={styles.buttonText}>AAB</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#0a84ff', marginTop: 10 }]}
        onPress={triggerWorkflow}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '⏳ Build en cours...' : '🚀 LANCER LE BUILD'}</Text>
      </TouchableOpacity>

      {downloadLink ? (
        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => Linking.openURL(downloadLink)}
        >
          <Text style={{ color: '#0a84ff', textDecorationLine: 'underline' }}>
            📥 Télécharger le build
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: '#0a84ff' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, fontSize: 16 },
  button: { width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buildTypeRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  buildTypeButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, backgroundColor: "#ccc" },
  activeButton: { backgroundColor: "#0a84ff" },
});
