import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  type: 'record' | 'streak' | 'doublePoints' | 'stageUp';
  userName: string;
  userGender: 'male' | 'female';
  data?: {
    newScore?: number;
    streakCount?: 5 | 10 | 20;
    bonusPoints?: number;
    currentStage?: 0 | 1 | 2 | 3;
    totalPoints?: number;
  };
  onContinue: () => void;
}

export const IncentivePopup: React.FC<Props> = ({
  visible,
  type,
  userName,
  userGender,
  data,
  onContinue,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getMessage = () => {
    if (type === 'record') {
      const prefix = userGender === 'female' ? 'כל הכבוד' : 'כל הכבוד';
      return `${prefix} ${userName}! שברת את השיא היומי! 🎉`;
    } else if (type === 'streak' && data?.streakCount) {
      const count = data.streakCount;
      if (count === 5) {
        return `כל הכבוד ${userName}! השגת 5 תשובות נכונות ומהירות ברצף!`;
      } else if (count === 10) {
        return `מדהים ${userName}! 10 תשובות נכונות ומהירות ברצף!`;
      } else if (count === 20) {
        return `הישג מדהים ${userName}! 20 תשובות נכונות ומהירות ברצף!`;
      }
    } else if (type === 'doublePoints') {
      const verb = userGender === 'female' ? 'תקבלי' : 'תקבל';
      return `${userName}, על השאלה הבאה ${verb} נקודות כפולות! 🎯`;
    } else if (type === 'stageUp' && data?.currentStage !== undefined) {
      const verb = userGender === 'female' ? 'הגעת' : 'הגעת';
      const stage = data.currentStage;
      if (stage === 0) {
        return `מעולה ${userName}! ${verb} ל-30 נקודות!\nהדמות שלך עלתה שלב!`;
      } else if (stage === 1) {
        return `כל הכבוד ${userName}! ${verb} ל-60 נקודות!\nהדמות שלך עלתה שלב!`;
      } else if (stage === 2) {
        return `מדהים ${userName}! ${verb} ל-90 נקודות!\nהדמות שלך עלתה שלב!`;
      }
    }
    return '';
  };

  const getEmoji = () => {
    if (type === 'record') {
      return '🏆';
    } else if (type === 'streak' && data?.streakCount) {
      if (data.streakCount === 5) return '⭐';
      if (data.streakCount === 10) return '🌟';
      if (data.streakCount === 20) return '💎';
    } else if (type === 'doublePoints') {
      return '🎯';
    } else if (type === 'stageUp') {
      return '🎊';
    }
    return '🎉';
  };

  const getSubMessage = () => {
    if (type === 'record' && data?.newScore) {
      return `השיא החדש שלך: ${data.newScore} נקודות`;
    } else if (type === 'streak' && data?.bonusPoints) {
      return `קיבלת בונוס של ${data.bonusPoints} נקודות!`;
    } else if (type === 'doublePoints') {
      return 'זו ההזדמנות שלך להרוויח מלא נקודות!';
    } else if (type === 'stageUp' && data?.currentStage !== undefined) {
      const stage = data.currentStage;
      if (stage === 0) {
        return 'לחץ על "הדמות שלי" כדי לבחור צבע!';
      } else if (stage === 1) {
        return 'לחץ על "הדמות שלי" כדי לבחור סקין!';
      } else if (stage === 2) {
        return 'לחץ על "הדמות שלי" כדי לבחור אנימציה!';
      }
    }
    return '';
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onContinue}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={
              type === 'record' 
                ? ['#e74c3c', '#c0392b']  // Red gradient for record
                : type === 'doublePoints'
                ? ['#c0392b', '#a93226']  // Dark red gradient for double points
                : type === 'stageUp'
                ? ['#9b59b6', '#8e44ad']  // Purple gradient for stage up
                : ['#e74c3c', '#d62c1a']  // Red gradient for streak
            }
            style={styles.gradient}
          >
            <Text style={styles.emoji}>{getEmoji()}</Text>
            <Text style={styles.message}>{getMessage()}</Text>
            {getSubMessage() && (
              <Text style={styles.subMessage}>{getSubMessage()}</Text>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
              <View style={styles.buttonInner}>
                <Text style={styles.continueButtonText}>נמשיך ←</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.95,
  },
  continueButton: {
    marginTop: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonInner: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

