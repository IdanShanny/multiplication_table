import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  BackHandler,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppData, Exercise, User } from '../types';
import { getExercisesByGroup } from '../exerciseLogic';
import {
  getTodayStats,
  getWeekStats,
  getAllTimeStats,
  formatTime,
} from '../statistics';

interface Props {
  user: User;
  appData: AppData;
  onBack: () => void;
}

const StatCard: React.FC<{
  title: string;
  time: string;
  correct: number;
  wrong: number;
  total: number;
}> = ({ title, time, correct, wrong, total }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{time}</Text>
      <Text style={styles.statLabel}>⏱️ זמן תרגול:</Text>
    </View>
    <View style={styles.statRow}>
      <Text style={[styles.statValue, styles.correctText]}>{correct}</Text>
      <Text style={styles.statLabel}>✅ תשובות נכונות:</Text>
    </View>
    <View style={styles.statRow}>
      <Text style={[styles.statValue, styles.wrongText]}>{wrong}</Text>
      <Text style={styles.statLabel}>❌ תשובות שגויות:</Text>
    </View>
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{total}</Text>
      <Text style={styles.statLabel}>📝 סה"כ שאלות:</Text>
    </View>
    {total > 0 && (
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(correct / total) * 100}%` },
          ]}
        />
      </View>
    )}
  </View>
);

const ExerciseGroup: React.FC<{
  group: 1 | 2 | 3 | 4;
  exercises: Exercise[];
}> = ({ group, exercises }) => {
  const groupColors: Record<1 | 2 | 3 | 4, readonly [string, string]> = {
    1: ['#27ae60', '#2ecc71'],  // Green for excellent (keeping for functionality - success indicator)
    2: ['#f39c12', '#e67e22'],  // Orange for good (keeping for functionality - warning indicator)
    3: ['#e74c3c', '#c0392b'],  // Red for needs practice
    4: ['#c0392b', '#a93226'],  // Dark red for needs more practice
  };

  const groupLabels: Record<1 | 2 | 3 | 4, string> = {
    1: '🌟 קבוצה 1 - מצוין!',
    2: '📚 קבוצה 2 - כמעט שם',
    3: '💪 קבוצה 3 - צריך תרגול',
    4: '🎯 קבוצה 4 - בואו נתרגל!',
  };

  if (exercises.length === 0) return null;

  return (
    <View style={styles.groupContainer}>
      <LinearGradient
        colors={groupColors[group]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.groupHeader}
      >
        <Text style={styles.groupCount}>{exercises.length} תרגילים</Text>
        <Text style={styles.groupTitle}>{groupLabels[group]}</Text>
      </LinearGradient>
      <View style={styles.exercisesList}>
        {exercises.map((ex) => (
          <View key={`${ex.a}×${ex.b}`} style={styles.exerciseItem}>
            <Text style={styles.exerciseItemText}>
              {ex.a}×{ex.b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ReportScreen: React.FC<Props> = ({ user, appData, onBack }) => {
  const todayStats = getTodayStats(appData.results);
  const weekStats = getWeekStats(appData.results);
  const allTimeStats = getAllTimeStats(appData.results);
  const exercisesByGroup = getExercisesByGroup(appData);

  // Handle Android back button and force RTL
  useEffect(() => {
    // Force RTL on every component mount to prevent layout flipping
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [onBack]);

  const openWhatsApp = () => {
    const phoneNumber = '972503337373';
    const message = `היי עידן! 👋 אני משתמש/ת באפליקציית לוח הכפל`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 הדו"ח של {user.name}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>→ חזרה</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Exercise Groups Section */}
          <Text style={styles.sectionTitle}>📋 תרגילים לפי קבוצות</Text>
          <Text style={styles.helpText}>
            כל תרגיל נמצא בקבוצה לפי רמת השליטה של {user.name}. תרגילים מקבוצה 4 מופיעים בתדירות גבוהה יותר באפליקציה, כך ש{user.gender === 'female' ? 'היא מתרגלת' : 'הוא מתרגל'} יותר את מה שצריך. זה עוזר לכם לראות במדויק איפה יש קושי ולתמוך בצורה ממוקדת.
          </Text>
          <Text style={styles.groupsExplanation}>
            קבוצה 1 = שולט היטב | קבוצה 4 = צריך תרגול נוסף
          </Text>

          <ExerciseGroup group={4} exercises={exercisesByGroup[4]} />
          <ExerciseGroup group={3} exercises={exercisesByGroup[3]} />
          <ExerciseGroup group={2} exercises={exercisesByGroup[2]} />
          <ExerciseGroup group={1} exercises={exercisesByGroup[1]} />

          {/* Statistics Section */}
          <Text style={styles.sectionTitle}>📈 סטטיסטיקות</Text>

          <StatCard
            title="היום"
            time={formatTime(todayStats.totalTime)}
            correct={todayStats.correctCount}
            wrong={todayStats.wrongCount}
            total={todayStats.totalCount}
          />

          <StatCard
            title="השבוע האחרון"
            time={formatTime(weekStats.totalTime)}
            correct={weekStats.correctCount}
            wrong={weekStats.wrongCount}
            total={weekStats.totalCount}
          />

          <StatCard
            title="מאז ומעולם"
            time={formatTime(allTimeStats.totalTime)}
            correct={allTimeStats.correctCount}
            wrong={allTimeStats.wrongCount}
            total={allTimeStats.totalCount}
          />

          {/* Feedback Button */}
          <TouchableOpacity style={styles.feedbackButton} onPress={openWhatsApp}>
            <Text style={styles.feedbackEmoji}>💬</Text>
            <Text style={styles.feedbackText}>יש לך רעיון? הצעה? הערה?</Text>
            <Text style={styles.feedbackSubtext}>לחץ כאן 🚀</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    writingDirection: 'rtl',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    writingDirection: 'ltr',
  },
  correctText: {
    color: '#27ae60',
  },
  wrongText: {
    color: '#e74c3c',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f8d7da',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  groupsExplanation: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  groupContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  groupHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  groupCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    writingDirection: 'rtl',
  },
  exercisesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  exerciseItem: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  exerciseItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    writingDirection: 'ltr',
  },
  bottomPadding: {
    height: 40,
  },
  feedbackButton: {
    backgroundColor: '#25D366',  // Keeping WhatsApp green for brand recognition
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  feedbackSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
});

