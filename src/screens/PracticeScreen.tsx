import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppData, Exercise, ExerciseResult, User } from '../types';
import { selectNextExercise } from '../exerciseLogic';
import { saveExerciseResult, loadAppData, saveAppData } from '../storage';
import { getCorrectMessages, getWrongMessages, getRandomMessage, getCorrectAnswerString } from '../messages';

interface Props {
  user: User;
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
  onShowReport: () => void;
}

export const PracticeScreen: React.FC<Props> = ({
  user,
  appData,
  onDataUpdate,
  onShowReport,
}) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean; correctAnswerStr?: string } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [showingFeedback, setShowingFeedback] = useState(false);
  
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const exerciseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    selectNewExercise();
  }, []);

  const selectNewExercise = async () => {
    const freshData = await loadAppData();
    const exercise = selectNextExercise(freshData, currentExercise || undefined);
    
    // Reset state immediately so input becomes editable
    setShowingFeedback(false);
    setFeedback(null);
    
    // Animate out old exercise
    Animated.timing(exerciseAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentExercise(exercise);
      setStartTime(Date.now());
      setAnswer('');
      
      // Animate in new exercise
      Animated.timing(exerciseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Focus input after animation completes
        inputRef.current?.focus();
      });
    });
    
    // Update the flag for showing wrong exercise
    if (freshData.lastWrongExercise) {
      if (freshData.showWrongExerciseNext) {
        freshData.lastWrongExercise = null;
        freshData.showWrongExerciseNext = false;
      } else {
        freshData.showWrongExerciseNext = true;
      }
      await saveAppData(freshData);
    }
    
    onDataUpdate(freshData);
  };

  const handleSubmit = async () => {
    if (!currentExercise || !answer.trim() || showingFeedback) return;

    const userAnswer = parseInt(answer, 10);
    if (isNaN(userAnswer)) return;

    const correctAnswer = currentExercise.a * currentExercise.b;
    const isCorrect = userAnswer === correctAnswer;
    const responseTime = Date.now() - startTime;

    const result: ExerciseResult = {
      a: currentExercise.a,
      b: currentExercise.b,
      userAnswer,
      correctAnswer,
      isCorrect,
      responseTime,
      timestamp: Date.now(),
    };

    await saveExerciseResult(result);
    
    // Get feedback message
    const messages = isCorrect
      ? getCorrectMessages(user.name, user.gender)
      : getWrongMessages(user.name, user.gender, currentExercise.a, currentExercise.b, correctAnswer);
    
    const message = getRandomMessage(messages);
    
    // For wrong answers, include the correct answer string for prominent display
    const correctAnswerStr = isCorrect ? undefined : getCorrectAnswerString(currentExercise.a, currentExercise.b, correctAnswer);
    
    setFeedback({ message, isCorrect, correctAnswerStr });
    setShowingFeedback(true);
    
    // Animate feedback
    feedbackAnim.setValue(0);
    Animated.spring(feedbackAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // No timeout - wait for user to click "Continue" button
  };

  const handleContinue = () => {
    selectNewExercise();
  };

  if (!currentExercise) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <Text style={styles.loadingText}>טוען...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>שלום, {user.name}! 👋</Text>
          <TouchableOpacity style={styles.reportButton} onPress={onShowReport}>
            <Text style={styles.reportButtonText}>📊 דוח</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: exerciseAnim,
              transform: [
                {
                  scale: exerciseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseText}>
              {currentExercise.a} × {currentExercise.b} = ?
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={answer}
              onChangeText={setAnswer}
              keyboardType="number-pad"
              placeholder="התשובה שלך"
              placeholderTextColor="#999"
              textAlign="center"
              editable={!showingFeedback}
              onSubmitEditing={handleSubmit}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, showingFeedback && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={showingFeedback || !answer.trim()}
          >
            <LinearGradient
              colors={showingFeedback ? ['#ccc', '#aaa'] : ['#00c6fb', '#005bea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>בדוק ✓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Feedback */}
        {feedback && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
              {
                opacity: feedbackAnim,
                transform: [
                  {
                    translateY: feedbackAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    scale: feedbackAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.05, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.feedbackEmoji}>
              {feedback.isCorrect ? '🎉' : '💪'}
            </Text>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
            {/* Show correct answer prominently for wrong answers */}
            {feedback.correctAnswerStr && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>התשובה הנכונה:</Text>
                <Text style={styles.correctAnswerText}>{feedback.correctAnswerStr}</Text>
              </View>
            )}
            {/* Continue button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>המשך ➜</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 30,
    marginBottom: 20,
  },
  greeting: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  exerciseContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 3,
    borderColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: '#f8f8ff',
    color: '#333',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 2,
  },
  feedbackWrong: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 2,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  correctAnswerContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

