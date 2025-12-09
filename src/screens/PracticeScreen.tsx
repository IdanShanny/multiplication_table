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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppData, Exercise, ExerciseResult, User, DELAY_THRESHOLD } from '../types';
import { selectNextExercise } from '../exerciseLogic';
import { saveExerciseResult, loadAppData, saveAppData, updateDailyScore, updateStreak, getIncentiveData, setDoublePointsForNextQuestion, checkAndConsumeDoublePoints } from '../storage';
import { getCorrectMessages, getWrongMessages, getRandomMessage, getCorrectAnswerString } from '../messages';
import { IncentivePopup } from '../components/IncentivePopup';

interface Props {
  user: User;
  appData: AppData;
  onDataUpdate: (data: AppData) => void;
  onShowParentsGuide: () => void;
}

export const PracticeScreen: React.FC<Props> = ({
  user,
  appData,
  onDataUpdate,
  onShowParentsGuide,
}) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean; correctAnswerStr?: string } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [showingFeedback, setShowingFeedback] = useState(false);
  
  // Incentive states
  const [dailyScore, setDailyScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showIncentivePopup, setShowIncentivePopup] = useState(false);
  const [incentivePopupType, setIncentivePopupType] = useState<'record' | 'streak' | 'doublePoints'>('record');
  const [incentivePopupData, setIncentivePopupData] = useState<any>(null);
  const [hasDoublePoints, setHasDoublePoints] = useState(false);
  
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const exerciseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    loadFirstExercise();
    loadIncentiveData();
  }, []);

  // Load incentive data
  const loadIncentiveData = async () => {
    try {
      const incentiveData = await getIncentiveData();
      setDailyScore(incentiveData.dailyScore);
      setHighScore(incentiveData.highScore);
      setHasDoublePoints(incentiveData.nextQuestionDoublePoints);
    } catch (error) {
      console.error('Error loading incentive data:', error);
    }
  };

  // Load first exercise immediately without animation
  const loadFirstExercise = async () => {
    try {
      const freshData = await loadAppData();
      const exercise = selectNextExercise(freshData, undefined);
      
      // Set exercise immediately on first load (no animation)
      setCurrentExercise(exercise);
      setStartTime(Date.now());
      isFirstLoad.current = false;
      
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
    } catch (error) {
      console.error('Error loading first exercise:', error);
      // Fallback: create a simple exercise
      setCurrentExercise({ a: 2, b: 3, group: 1 });
      setStartTime(Date.now());
    }
  };

  const selectNewExercise = async () => {
    try {
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
        
        // Update double points state from storage
        getIncentiveData().then((incentiveData) => {
          setHasDoublePoints(incentiveData.nextQuestionDoublePoints);
        });
        
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
    } catch (error) {
      console.error('Error selecting new exercise:', error);
      // Don't get stuck - just pick a random exercise
      const randomA = Math.floor(Math.random() * 10) + 1;
      const randomB = Math.floor(Math.random() * 10) + 1;
      setCurrentExercise({ a: randomA, b: randomB, group: 3 });
      setStartTime(Date.now());
      setAnswer('');
      setShowingFeedback(false);
      setFeedback(null);
    }
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
    
    // Check if this question had double points
    const hadDoublePoints = await checkAndConsumeDoublePoints();
    // Note: We keep hasDoublePoints state true until next question loads
    // so the banner stays visible during feedback
    
    // Calculate points based on the incentive rules
    let points = 0;
    const isFast = responseTime < DELAY_THRESHOLD;
    
    if (isCorrect) {
      points = isFast ? 3 : 1;
    } else {
      points = -1;
    }
    
    // Apply double points multiplier if active
    if (hadDoublePoints) {
      points *= 2;
    }
    
    // Update daily score
    const scoreResult = await updateDailyScore(points);
    setDailyScore(scoreResult.newScore);
    setHighScore(scoreResult.isNewRecord ? scoreResult.newScore : highScore);
    
    // Update streak and check for achievements
    const streakResult = await updateStreak(isCorrect && isFast);
    
    // Check if we need to show incentive popup (only for correct answers)
    const hasStreakAchievement = streakResult.achievementReached;
    const hasRecordPopup = scoreResult.shouldShowRecordPopup;
    const showIncentive = isCorrect && (hasStreakAchievement || hasRecordPopup);
    
    // If showing incentive popup, skip the regular feedback and show popup directly
    if (showIncentive) {
      setShowingFeedback(true);
      
      if (hasStreakAchievement) {
        // Add bonus points for streak achievement
        const bonusPoints = streakResult.achievementReached!;
        updateDailyScore(bonusPoints).then((result) => {
          setDailyScore(result.newScore);
          if (result.isNewRecord) {
            setHighScore(result.newScore);
          }
        });
        
        setIncentivePopupType('streak');
        setIncentivePopupData({
          streakCount: streakResult.achievementReached,
          bonusPoints: bonusPoints,
        });
        setShowIncentivePopup(true);
      } else if (hasRecordPopup) {
        setIncentivePopupType('record');
        setIncentivePopupData({
          newScore: scoreResult.newScore,
        });
        setShowIncentivePopup(true);
      }
    } else {
      // Show regular feedback (for wrong answers or correct without incentive)
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
      }).start(() => {
        // After regular feedback, randomly show double points popup (10% chance)
        const shouldShowDoublePoints = Math.random() < 0.1;
        if (shouldShowDoublePoints) {
          setDoublePointsForNextQuestion(true);
          setHasDoublePoints(true);
          setIncentivePopupType('doublePoints');
          setIncentivePopupData({});
          setShowIncentivePopup(true);
        }
      });
    }

    // No timeout - wait for user to click "Continue" button
  };

  const handleContinue = () => {
    // If incentive popup is showing, don't load new exercise yet
    if (!showIncentivePopup) {
      selectNewExercise();
    }
  };

  const handleIncentiveContinue = () => {
    setShowIncentivePopup(false);
    // Now load the new exercise
    selectNewExercise();
  };

  if (!currentExercise) {
  return (
    <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.container}>
      <Text style={styles.loadingText}>טוען...</Text>
    </LinearGradient>
  );
  }

  return (
    <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>שלום, {user.name}! 👋</Text>
            <TouchableOpacity style={styles.reportButton} onPress={onShowParentsGuide}>
              <Text style={styles.reportButtonText}>👨‍👩‍👧 להורים</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Score Display */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>ניקוד יומי</Text>
              <Text style={styles.scoreValue}>{dailyScore}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>שיא יומי</Text>
              <Text style={styles.scoreValue}>{highScore}</Text>
            </View>
          </View>

          {/* Double Points Indicator */}
          {hasDoublePoints && (
            <View style={styles.doublePointsBanner}>
              <Text style={styles.doublePointsText}>🎯 נקודות כפולות! 🎯</Text>
            </View>
          )}

          {/* Exercise Card */}
          <Animated.View
            style={[
              styles.card,
              hasDoublePoints && styles.cardDoublePoints,
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
                colors={showingFeedback ? ['#ccc', '#aaa'] : ['#e74c3c', '#c0392b']}
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
                <Text style={styles.continueButtonText}>נמשיך ←</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Incentive Popup */}
      <IncentivePopup
        visible={showIncentivePopup}
        type={incentivePopupType}
        userName={user.name}
        userGender={user.gender}
        data={incentivePopupData}
        onContinue={handleIncentiveContinue}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 80 : 40, // Much more padding for Android devices with gesture navigation
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
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 16,
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  doublePointsBanner: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  doublePointsText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDoublePoints: {
    borderWidth: 4,
    borderColor: '#9C27B0',
    shadowColor: '#9C27B0',
  },
  exerciseContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  exerciseText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 3,
    borderColor: '#e74c3c',
    borderRadius: 16,
    padding: 16,
    fontSize: 28,
    fontWeight: 'bold',
    backgroundColor: '#fff5f5',
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
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 20,
    paddingBottom: 24, // Extra bottom padding to keep content above system buttons
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 40 : 20, // Increased margin for Android
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
    fontSize: 40,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  correctAnswerContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 3,
    borderColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  correctAnswerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

