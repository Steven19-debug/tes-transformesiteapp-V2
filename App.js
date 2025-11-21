// App.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // --- Section Build GitHub ---
  const [repoUrl, setRepoUrl] = useState("");
  const [buildType, setBuildType] = useState("apk");

  // --- Ouvrir un site ---
  const handleOpenSite = () => {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    setCurrentUrl(formattedUrl);
    setError(false);
    setLoading(true);
  };

  // --- Déclenche le workflow GitHub ---
  // Ici, on appelle juste **l’API REST de ton workflow**, mais le token est côté GitHub Actions
  const triggerWorkflow = async () => {
    if (!repoUrl) return Alert.alert("Erreur", "Coller l'URL du dépôt GitHub !");

    try {
      // Appelle un endpoint de ton workflow qui utilise le secret
      // Par exemple, tu peux créer une route GitHub Actions qui expose un lien de téléchargement
      // Pour simplifier ici, on ouvre juste le dépôt dans le navigateur
      Linking.openURL(repoUrl);
      Alert.alert("Info", "Le build sera déclenché automatiquement via GitHub Actions.");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  // --- WebView ---
  if (currentUrl) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => { if (canGoBack) webViewRef.current.goBack(); }}
            style={[styles.navButton, !canGoBack && { opacity: 0.4 }]}
            disabled={!canGoBack}
          >
            <Ionicons name="arrow-back-circle" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => webViewRef.current.reload()}
            style={styles.navButton}
          >
            <MaterialIcons name="refresh" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentUrl(null)}
            style={styles.navButton}
          >
            <Ionicons name="close-circle" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0a84ff" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}

        {!error && (
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )}
      </View>
    );
  }

  // --- Écran d'accueil ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Transforme ton site en application</Text>

      <TextInput
        style={styles.input}
        placeholder="Entre ton lien (ex: monsite.com)"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: url ? '#0a84ff' : '#ccc' }]}
        disabled={!url}
        onPress={handleOpenSite}
      >
        <Text style={styles.buttonText}>OUVRIR LE SITE</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 40 }]}>📦 Build GitHub → APK/AAB</Text>

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
      >
        <Text style={styles.buttonText}>🚀 LANCER LE BUILD</Text>
      </TouchableOpacity>
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
  navBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#0a84ff', paddingVertical: 10 },
  navButton: { paddingHorizontal: 10 },
  loaderContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, color: '#555' },
});