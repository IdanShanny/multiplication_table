import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gender, User } from '../types';

interface Props {
  onRegister: (user: User) => void;
}

export const RegistrationScreen: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState('');

  // Force RTL on component mount
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('נא להזין שם');
      return;
    }
    if (!gender) {
      setError('נא לבחור בן או בת');
      return;
    }
    onRegister({ name: name.trim(), gender });
  };

  return (
    <LinearGradient
      colors={['#e74c3c', '#c0392b']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          <Text style={styles.title}>🎓 לוח הכפל</Text>
          <Text style={styles.subtitle}>בואו נתחיל ללמוד!</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>איך קוראים לך?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              placeholder="הכנס את שמך"
              placeholderTextColor="#999"
              textAlign="right"
              maxLength={12}
            />
          </View>

          <View style={styles.genderContainer}>
            <Text style={styles.label}>אני...</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => {
                  setGender('male');
                  setError('');
                }}
              >
                <Text style={styles.genderEmoji}>👦</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === 'male' && styles.genderTextSelected,
                  ]}
                >
                  בן
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => {
                  setGender('female');
                  setError('');
                }}
              >
                <Text style={styles.genderEmoji}>👧</Text>
                <Text
                  style={[
                    styles.genderText,
                    gender === 'female' && styles.genderTextSelected,
                  ]}
                >
                  בת
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <LinearGradient
              colors={['#e74c3c', '#c0392b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>בואו נתחיל! 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#f8f8f8',
  },
  genderContainer: {
    marginBottom: 24,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genderButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    width: '45%',
  },
  genderButtonSelected: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  genderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  genderTextSelected: {
    color: '#e74c3c',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

