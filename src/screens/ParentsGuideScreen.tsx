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
import { User } from '../types';

interface Props {
  user: User;
  onBack: () => void;
  onShowReport: () => void;
}

export const ParentsGuideScreen: React.FC<Props> = ({ user, onBack, onShowReport }) => {
  // Handle Android back button and force RTL
  useEffect(() => {
    // Force RTL on every component mount to prevent layout flipping
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });

    return () => backHandler.remove();
  }, [onBack]);

  const openEmail = () => {
    const email = 'idan.shanny@gmail.com';
    const subject = 'משוב על אפליקציית לוח הכפל';
    const body = 'היי עידן! 👋\n\nאני משתמש/ת באפליקציית לוח הכפל ורציתי לשתף:\n\n';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>מדריך להורים</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>→ חזרה</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Report Button */}
        <TouchableOpacity style={styles.reportButtonLarge} onPress={onShowReport}>
          <LinearGradient
            colors={['#27ae60', '#2ecc71']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reportButtonGradient}
          >
            <Text style={styles.reportButtonIcon}>📊</Text>
            <Text style={styles.reportButtonText}>רוצים לראות איך {user.name} {user.gender === 'female' ? 'מתקדמת' : 'מתקדם'}?</Text>
            <Text style={styles.reportButtonSubtext}>לחצו כאן לצפייה בדו"ח מפורט</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>🎓 אפליקציית לוח הכפל</Text>

          <Text style={styles.sectionTitle}>💡 למה פיתחתי את האפליקציה?</Text>
          <Text style={styles.text}>
            חיפשתי לנדב, הבן שלי, דרך איכותית ללימוד לוח הכפל ולא מצאתי שום דבר רציני. רוב האפליקציות זורקות שאלות אקראיות בלי לוגיקה, או מלאות בפרסומות.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              אז פיתחתי אפליקציה שבאמת עובדת - מבוססת על עקרונות פדגוגיים נכונים, נקייה מפרסומות וממוקדת ב-100% בלמידה.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>🎯 למה לוח הכפל כל כך חשוב?</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>לוח הכפל הוא תשתית בסיסית לכל הלמידה המתמטית.</Text>
          </View>
          <Text style={styles.text}>
            כשמלמדים כפל ארוך, חילוק, שברים ואלגברה - ילד שלא שולט בלוח הכפל חייב להתרכז בחישובים הבסיסיים, ולכן מתקשה ללמוד את החומר החדש.
          </Text>
          <Text style={styles.text}>
            ילד ששולט בלוח הכפל באופן אוטומטי יכול להתמקד בהבנת הבעיה ובלמידת מושגים חדשים - ולא בחישובים.
          </Text>

          <Text style={styles.sectionTitle}>🧠 איך האפליקציה עובדת?</Text>
          
          <Text style={styles.subSectionTitle}>🎯 למידה מותאמת אישית</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              הבעיה באפליקציות רגילות: שאלות אקראיות. ילד מקבל את 7×6, ואז לא רואה את אותו תרגיל שוב הרבה זמן.
            </Text>
          </View>
          <Text style={styles.text}>
            <Text style={styles.bold}>הפתרון:</Text> האפליקציה מחלקת את 100 התרגילים ל-4 קבוצות לפי רמת השליטה:
          </Text>

          <View style={styles.groupCard1}>
            <Text style={styles.groupText}>🟢 קבוצה 1 (ירוק) - שליטה מצוינת</Text>
          </View>
          <View style={styles.groupCard2}>
            <Text style={styles.groupText}>🟡 קבוצה 2 (צהוב) - שליטה טובה</Text>
          </View>
          <View style={styles.groupCard3}>
            <Text style={styles.groupText}>🟠 קבוצה 3 (כתום) - דורש תרגול</Text>
          </View>
          <View style={styles.groupCard4}>
            <Text style={styles.groupText}>🔴 קבוצה 4 (אדום) - דורש תשומת לב מיוחדת</Text>
          </View>

          <Text style={styles.text}>
            <Text style={styles.bold}>כל תרגיל עובר בין הקבוצות באופן דינמי:</Text>
          </Text>
          <Text style={styles.bulletText}>✅ ענה נכון ומהר? התרגיל יורד קבוצה (ולכן מופיע לעיתים רחוקות יותר)</Text>
          <Text style={styles.bulletText}>❌ ענה לא נכון או לאט? התרגיל עולה קבוצה (ומופיע יותר)</Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              תרגילים מקבוצה גבוהה מופיעים בהסתברות גדולה יותר.
            </Text>
            <Text style={styles.highlightText}>
              המשמעות: הילד מתרגל בדיוק את מה שהוא צריך, בדיוק בתדירות הנכונה.
            </Text>
          </View>

          <Text style={styles.text}>
            כשהילד טועה בשאלה, התשובה הנכונה מופיעה ואותה שאלה תופיע שוב אחרי השאלה הבאה, כדי לעזור להפנמה ויישום.
          </Text>

          <Text style={styles.sectionTitle}>🎁 מערכת תמריצים</Text>
          <Text style={styles.text}>
            כדי להפוך את התרגול למשהו שהילד <Text style={styles.emphasizedText}>רוצה לעשות, ולא רק צריך</Text>, ישנה מערכת תמריצים מגוונת:
          </Text>
          <Text style={styles.bulletText}>• ניקוד יומי - צבירת נקודות על תשובות נכונות, עם שיא יומי שמעודד שיפור</Text>
          <Text style={styles.bulletText}>• בונוסים על רצפים - הישגים מיוחדים כשעונים נכון כמה פעמים ברצף</Text>
          <Text style={styles.bulletText}>• הפתעות אקראיות - שאלות עם נקודות כפולות שמופיעות באופן בלתי צפוי</Text>
          <Text style={styles.text}>
            האלמנט המשחקי הזה יוצר מוטיבציה פנימית ומעודד תרגול יומי עצמאי.
          </Text>

          <Text style={styles.sectionTitle}>📈 דו"ח התקדמות - כלי לעקוב ולעזור</Text>
          <Text style={styles.text}>
            לחצו על כפתור <Text style={styles.bold}>"צפייה בדו"ח מפורט"</Text> למעלה כדי לראות סטטיסטיקות (היום, השבוע, כל הזמנים) וחלוקה לפי קבוצות - זה החלק הכי שימושי!
          </Text>

          <Text style={styles.subSectionTitle}>💡 איך להשתמש במידע?</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              <Text style={styles.bold}>תרחיש נפוץ:</Text> יש 2-3 תרגילים תקועים בקבוצה 4 (אדום).
            </Text>
            <Text style={styles.highlightText}>
              {'\n'}<Text style={styles.bold}>מה לעשות?</Text>
            </Text>
            <Text style={styles.highlightText}>1. כתבו פוסטר עם התרגילים והתשובות ותלו בחדר</Text>
            <Text style={styles.highlightText}>2. תרגלו בעל פה בדרך לבית ספר</Text>
            <Text style={styles.highlightText}>3. הסבירו טריקים לזכירה</Text>
            <Text style={styles.highlightText}>4. תנו חיזוק חיובי כשהתרגיל יורד לקבוצה 3</Text>
          </View>

          <Text style={styles.sectionTitle}>📱 איך להשתמש נכון?</Text>
          
          <Text style={styles.subSectionTitle}>⏰ תדירות</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>עדיף 10 דקות כל יום מאשר שעה פעם בשבוע.</Text>
          </View>
          <Text style={styles.text}>
            למידה מרווחת היא הדרך היעילה ביותר. תרגול קצר ויומי גורם למוח לשמור את המידע בזיכרון ארוך טווח.
          </Text>

          <Text style={styles.subSectionTitle}>🎮 טיפים</Text>
          <Text style={styles.bulletText}>• אל תכפו - אם הילד עייף, עדיף לדלג על יום</Text>
          <Text style={styles.bulletText}>• חגגו הצלחות - תנו חיזוק חיובי</Text>
          <Text style={styles.bulletText}>• מקום שקט - בלי הסחות דעת</Text>
          <Text style={styles.bulletText}>• זמן קבוע - למשל, כל יום אחרי הצהריים</Text>

          <Text style={styles.sectionTitle}>🎯 סיכום</Text>
          <Text style={styles.text}>
            לוח הכפל הוא תשתית קריטית להצלחה במתמטיקה. האפליקציה הזו היא כלי למידה מצוין שמבוסס על עקרונות פדגוגיים נכונים: למידה מותאמת אישית, חזרה מרווחת, מדידת מהירות, מוטיבציה מובנית וכלי מעקב להורים - והכי חשוב, היא עובדת.
          </Text>
          <Text style={styles.text}>
            תנו לילד שלכם 10 דקות ביום, עקבו אחרי ההתקדמות, ותראו כמה מהר הוא משיג שליטה מלאה בלוח הכפל.
          </Text>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>יש לכם רעיון? הצעה? הערה?</Text>
            <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
              <LinearGradient
                colors={['#4285F4', '#34A853']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emailGradient}
              >
                <Text style={styles.emailIcon}>✉️</Text>
                <Text style={styles.emailText}>שלחו הודעה במייל</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>בהצלחה!</Text>
            <Text style={styles.footerAuthor}>עידן</Text>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    writingDirection: 'rtl',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  reportButtonLarge: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  reportButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  reportButtonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  reportButtonSubtext: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.95,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 25,
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c0392b',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  emphasizedText: {
    fontWeight: 'bold',
    color: '#e74c3c',
    fontSize: 17,
  },
  textCenter: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  ltr: {
    writingDirection: 'ltr',
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
    marginRight: 10,
  },
  highlightBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#ffc107',
    borderRadius: 8,
    marginBottom: 15,
  },
  highlightText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 5,
  },
  warningBox: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#dc3545',
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#d1ecf1',
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#17a2b8',
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  successBox: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRightWidth: 4,
    borderRightColor: '#28a745',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  successTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  groupCard1: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRightWidth: 4,
    borderRightColor: '#28a745',
    borderRadius: 8,
    marginBottom: 8,
  },
  groupCard2: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRightWidth: 4,
    borderRightColor: '#ffc107',
    borderRadius: 8,
    marginBottom: 8,
  },
  groupCard3: {
    backgroundColor: '#ffe5d0',
    padding: 12,
    borderRightWidth: 4,
    borderRightColor: '#fd7e14',
    borderRadius: 8,
    marginBottom: 8,
  },
  groupCard4: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRightWidth: 4,
    borderRightColor: '#dc3545',
    borderRadius: 8,
    marginBottom: 15,
  },
  groupText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  contactSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
  },
  emailGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  emailIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  emailText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  footerAuthor: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

