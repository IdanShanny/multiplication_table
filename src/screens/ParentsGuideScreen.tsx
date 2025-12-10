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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types';

interface Props {
  user: User;
  onBack: () => void;
  onShowReport: () => void;
}

export const ParentsGuideScreen: React.FC<Props> = ({ user, onBack, onShowReport }) => {
  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>מדריך להורים</Text>
        <View style={styles.placeholder} />
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
            <Text style={styles.reportButtonText}>רוצים לראות איך {user.name} מתקדם/ת?</Text>
            <Text style={styles.reportButtonSubtext}>לחצו כאן לדוח מפורט</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>🎓 אפליקציית לוח הכפל</Text>

          <Text style={styles.sectionTitle}>💡 למה פיתחתי את האפליקציה?</Text>
          <Text style={styles.text}>
            חיפשתי אפליקציה איכותית ללימוד לוח הכפל ולא מצאתי שום דבר רציני. רוב האפליקציות זורקות שאלות אקראיות בלי לוגיקה, או מלאות בפרסומות.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              אז פיתחתי אפליקציה שבאמת עובדת - מבוססת על עקרונות פדגוגיים נכונים, נקייה מפרסומות, וממוקדת ב-100% בלמידה.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>🎯 למה לוח הכפל כל כך חשוב?</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>לוח הכפל הוא תשתית בסיסית לכל הלמידה המתמטית.</Text>
          </View>
          <Text style={styles.text}>
            כשמלמדים כפל ארוך, חילוק, שברים ואלגברה - ילד שלא שולט בלוח הכפל חייב להתרכז בחישובים הבסיסיים, ולכן מתקשה ללמוד את החומר החדש. זה כמו לנסות לקרוא ספר כשעדיין מתקשים לזהות אותיות.
          </Text>
          <Text style={styles.text}>
            ילד ששולט בלוח הכפל באופן אוטומטי יכול להתמקד בהבנת הבעיה ובלמידת מושגים חדשים - ולא בחישובים.
          </Text>

          <Text style={styles.sectionTitle}>🧠 איך האפליקציה עובדת?</Text>
          
          <Text style={styles.subSectionTitle}>🎯 למידה מותאמת אישית</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              הבעיה באפליקציות רגילות: שאלות אקראיות. ילד עונה נכון על 7×8, ואז לא רואה את זה שוב במשך 50 שאלות.
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
          <Text style={styles.bulletText}>✅ ענה נכון ומהר? התרגיל יורד קבוצה (מופיע לעיתים רחוקות יותר)</Text>
          <Text style={styles.bulletText}>❌ ענה לא נכון או לאט? התרגיל עולה קבוצה (מופיע יותר)</Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              תרגילים מקבוצה גבוהה מופיעים בהסתברות גדולה יותר.
            </Text>
            <Text style={styles.highlightText}>
              המשמעות: הילד מתרגל בדיוק את מה שהוא צריך, בדיוק בתדירות הנכונה.
            </Text>
          </View>

          <Text style={styles.subSectionTitle}>🔄 חזרה מיידית על טעויות</Text>
          <Text style={styles.text}>
            כשילד טועה, האפליקציה מציגה את התשובה הנכונה. <Text style={styles.bold}>אחרי שאלה אחת, התרגיל חוזר שוב</Text> - חזרה מרווחת שעוזרת לקליטת הידע.
          </Text>

          <Text style={styles.subSectionTitle}>⏱️ מדידת מהירות</Text>
          <Text style={styles.text}>
            יש הבדל עצום בין ילד שעונה 7×8=56 אחרי 15 שניות לבין ילד שעונה תוך שנייה. <Text style={styles.bold}>רק שליטה אוטומטית עוזרת בלמידה מתקדמת.</Text>
          </Text>
          <Text style={styles.bulletText}>✅ תשובה נכונה מתחת ל-10 שניות = התרגיל יורד קבוצה</Text>
          <Text style={styles.bulletText}>⚠️ תשובה נכונה מעל 10 שניות = התרגיל נשאר באותה קבוצה</Text>
          <Text style={styles.bulletText}>❌ תשובה שגויה = התרגיל עולה קבוצה</Text>

          <Text style={styles.sectionTitle}>🎁 מערכת תמריצים</Text>
          
          <Text style={styles.subSectionTitle}>📊 ניקוד יומי</Text>
          <Text style={styles.bulletText}>• <Text style={styles.ltr}>+3</Text> נקודות על תשובה נכונה ומהירה</Text>
          <Text style={styles.bulletText}>• <Text style={styles.ltr}>+1</Text> נקודה על תשובה נכונה איטית</Text>
          <Text style={styles.bulletText}>• <Text style={styles.ltr}>-1</Text> נקודה על תשובה שגויה</Text>
          <Text style={styles.text}>
            הילד רואה את הניקוד בזמן אמת ואת השיא היומי. כשהוא שובר את השיא, הוא מקבל פופ-אפ מעודד.
          </Text>

          <Text style={styles.subSectionTitle}>🔥 רצפי הצלחה</Text>
          <Text style={styles.bulletText}>• 5 תשובות ברצף = <Text style={styles.ltr}>+5</Text> נקודות בונוס 🌟</Text>
          <Text style={styles.bulletText}>• 10 ברצף = <Text style={styles.ltr}>+10</Text> נקודות בונוס ⭐</Text>
          <Text style={styles.bulletText}>• 20 ברצף = <Text style={styles.ltr}>+20</Text> נקודות בונוס 💎</Text>

          <Text style={styles.subSectionTitle}>🎯 נקודות כפולות</Text>
          <Text style={styles.text}>
            באופן אקראי (10%), הילד מקבל הודעה: "על השאלה הבאה תקבל/י נקודות כפולות!" - השאלה הבאה מסומנת בבאנר סגול והניקוד מוכפל פי שניים.
          </Text>

          <Text style={styles.sectionTitle}>📈 דוח התקדמות - כלי לעקוב ולעזור</Text>
          <Text style={styles.text}>
            לחצו על כפתור "דוח" כדי לראות סטטיסטיקות (היום, השבוע, כל הזמנים) וחלוקה לפי קבוצות - זה החלק הכי שימושי!
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

          <Text style={styles.sectionTitle}>✨ למה האפליקציה שונה?</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>✅ למידה חכמה - כל תרגיל מותאם לרמת הילד</Text>
            <Text style={styles.highlightText}>✅ מוטיבציה מובנית - ניקוד, הישגים, הפתעות</Text>
            <Text style={styles.highlightText}>✅ כלי מעקב - דוח מפורט לזיהוי קשיים</Text>
            <Text style={styles.highlightText}>✅ חינם לחלוטין - ללא פרסומות, ללא רכישות</Text>
            <Text style={styles.highlightText}>✅ פרטיות מלאה - כל המידע נשמר רק במכשיר</Text>
            <Text style={styles.highlightText}>✅ מבוסס על מחקר - למידה מרווחת, חזרה מיידית, מדידת מהירות</Text>
          </View>

          <Text style={styles.sectionTitle}>🎯 סיכום</Text>
          <Text style={styles.text}>
            לוח הכפל הוא תשתית קריטית להצלחה במתמטיקה. ילד ששולט בו באופן אוטומטי יכול להתמקד בלמידה של נושאים מתקדמים.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              האפליקציה הזו היא כלי למידה רציני שמבוסס על עקרונות פדגוגיים נכונים: למידה מותאמת אישית, חזרה מרווחת, מדידת מהירות, מוטיבציה מובנית, וכלי מעקב להורים.
            </Text>
          </View>
          <View style={styles.successBox}>
            <Text style={styles.successTextLarge}>והכי חשוב - היא עובדת.</Text>
          </View>
          <Text style={styles.textCenter}>
            תנו לילד שלכם 10 דקות ביום, עקבו אחרי ההתקדמות, ותראו איך תוך מספר שבועות הוא משיג שליטה מלאה בלוח הכפל.
          </Text>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>יש לך רעיון? הצעה? הערה?</Text>
            <Text style={styles.contactText}>
              אשמח לשמוע ממך! לחץ על הכפתור ושלח לי הודעה בווטסאפ 💬
            </Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.whatsappGradient}
              >
                <Text style={styles.whatsappIcon}>💬</Text>
                <Text style={styles.whatsappText}>שלח הודעה בווטסאפ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>בהצלחה!</Text>
            <Text style={styles.footerAuthor}>עידן שני{'\n'}מפתח האפליקציה</Text>
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
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
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
  whatsappButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
  },
  whatsappGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  whatsappIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  whatsappText: {
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

