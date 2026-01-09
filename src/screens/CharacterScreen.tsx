import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, CharacterStage, CompletedCharacter, CharacterColor, CharacterSkin, CharacterAnimation } from '../types';
import { getCharacterData, getIncentiveData, updateCharacterColor, updateCharacterSkin, updateCharacterAnimation, completeCharacter, getPointsForNextStage } from '../storage';

interface Props {
  user: User;
  onBack: () => void;
}

type SelectionMode = 'none' | 'color' | 'skin' | 'animation';

export const CharacterScreen: React.FC<Props> = ({ user, onBack }) => {
  const [currentCharacter, setCurrentCharacter] = useState<CharacterStage>({ stage: 0 });
  const [completedCharacters, setCompletedCharacters] = useState<CompletedCharacter[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [animValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Animate character when it changes
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentCharacter]);

  const loadData = async () => {
    const characterData = await getCharacterData();
    const incentiveData = await getIncentiveData();
    setCurrentCharacter(characterData.currentCharacter);
    setCompletedCharacters(characterData.completedCharacters);
    setTotalPoints(incentiveData.totalPoints);
  };

  const getPointsNeededForNextStage = (): number => {
    return getPointsForNextStage(currentCharacter.stage);
  };

  const canProgressToNextStage = (): boolean => {
    return totalPoints >= getPointsNeededForNextStage();
  };

  const handleStageProgress = () => {
    if (!canProgressToNextStage()) return;

    const stage = currentCharacter.stage;
    if (stage === 0) {
      // Progress to stage 1 - choose color
      setSelectionMode('color');
    } else if (stage === 1) {
      // Progress to stage 2 - choose skin
      setSelectionMode('skin');
    } else if (stage === 2) {
      // Progress to stage 3 - choose animation
      setSelectionMode('animation');
    }
  };

  const handleColorSelection = async (color: CharacterColor) => {
    await updateCharacterColor(color);
    await loadData();
    setSelectionMode('none');
  };

  const handleSkinSelection = async (skin: CharacterSkin) => {
    await updateCharacterSkin(skin);
    await loadData();
    setSelectionMode('none');
  };

  const handleAnimationSelection = async (animation: CharacterAnimation) => {
    await updateCharacterAnimation(animation);
    await loadData();
    setSelectionMode('none');
  };

  const handleCompleteCharacter = async () => {
    await completeCharacter();
    await loadData();
  };

  const getColorName = (color: CharacterColor): string => {
    switch (color) {
      case 'white': return 'לבן';
      case 'brown': return 'שחום';
      case 'skin': return 'צבע גוף';
    }
  };

  const getSkinName = (skin: CharacterSkin): string => {
    switch (skin) {
      case 'winter': return 'חורפי';
      case 'festive': return 'חגיגי';
      case 'summer': return 'קיצי';
    }
  };

  const getAnimationName = (animation: CharacterAnimation): string => {
    switch (animation) {
      case 'jump': return 'ניתור';
      case 'smile': return 'חיוך';
      case 'spin': return 'סיבוב';
    }
  };

  const renderCharacter = () => {
    const stage = currentCharacter.stage;
    
    // Character emoji based on stage
    let characterEmoji = '👤'; // Gray silhouette for stage 0
    
    if (stage >= 1 && currentCharacter.color) {
      // Stage 1+: Colored character
      switch (currentCharacter.color) {
        case 'white': characterEmoji = '👱'; break;
        case 'brown': characterEmoji = '👨🏾'; break;
        case 'skin': characterEmoji = '👨'; break;
      }
    }
    
    // Add clothing/skin for stage 2+
    let skinEmoji = '';
    if (stage >= 2 && currentCharacter.skin) {
      switch (currentCharacter.skin) {
        case 'winter': skinEmoji = '🧥'; break;
        case 'festive': skinEmoji = '🎩'; break;
        case 'summer': skinEmoji = '👕'; break;
      }
    }
    
    // Animation for stage 3+
    const shouldAnimate = stage >= 3 && currentCharacter.animation;
    const rotation = shouldAnimate ? animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', currentCharacter.animation === 'spin' ? '360deg' : '0deg'],
    }) : '0deg';
    
    const scale = shouldAnimate ? animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, currentCharacter.animation === 'jump' ? 1.2 : 1, 1],
    }) : 1;

    return (
      <Animated.View style={[styles.characterDisplay, { transform: [{ rotate: rotation }, { scale }] }]}>
        <Text style={styles.characterEmoji}>{characterEmoji}</Text>
        {skinEmoji && <Text style={styles.skinEmoji}>{skinEmoji}</Text>}
      </Animated.View>
    );
  };

  const renderStageInfo = () => {
    const stage = currentCharacter.stage;
    const pointsNeeded = getPointsNeededForNextStage();
    const canProgress = canProgressToNextStage();

    let stageText = '';
    let nextStageText = '';

    switch (stage) {
      case 0:
        stageText = 'דמות אפורה';
        nextStageText = 'בחר צבע לדמות';
        break;
      case 1:
        stageText = `דמות בצבע ${currentCharacter.color ? getColorName(currentCharacter.color) : ''}`;
        nextStageText = 'בחר סקין לדמות';
        break;
      case 2:
        stageText = `דמות עם סקין ${currentCharacter.skin ? getSkinName(currentCharacter.skin) : ''}`;
        nextStageText = 'בחר אנימציה לדמות';
        break;
      case 3:
        stageText = `דמות עם אנימציה ${currentCharacter.animation ? getAnimationName(currentCharacter.animation) : ''}`;
        nextStageText = 'השלם את הדמות!';
        break;
    }

    return (
      <View style={styles.stageInfo}>
        <Text style={styles.stageText}>{stageText}</Text>
        {stage < 3 && (
          <>
            <View style={styles.progressBar}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((totalPoints / pointsNeeded) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {totalPoints} / {pointsNeeded} נקודות
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.progressButton, !canProgress && styles.progressButtonDisabled]}
              onPress={handleStageProgress}
              disabled={!canProgress}
            >
              <Text style={styles.progressButtonText}>
                {canProgress ? nextStageText : `צריך עוד ${pointsNeeded - totalPoints} נקודות`}
              </Text>
            </TouchableOpacity>
          </>
        )}
        {stage === 3 && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteCharacter}
          >
            <Text style={styles.completeButtonText}>✨ {nextStageText} ✨</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSelectionModal = () => {
    if (selectionMode === 'none') return null;

    let title = '';
    let options: { value: string; label: string }[] = [];

    if (selectionMode === 'color') {
      title = 'בחר צבע לדמות';
      options = [
        { value: 'white', label: 'לבן' },
        { value: 'brown', label: 'שחום' },
        { value: 'skin', label: 'צבע גוף' },
      ];
    } else if (selectionMode === 'skin') {
      title = 'בחר סקין אחד מהבאים';
      options = [
        { value: 'winter', label: 'חורפי' },
        { value: 'festive', label: 'חגיגי' },
        { value: 'summer', label: 'קיצי' },
      ];
    } else if (selectionMode === 'animation') {
      title = 'בחר אנימציה לדמות';
      options = [
        { value: 'jump', label: 'ניתור' },
        { value: 'smile', label: 'חיוך' },
        { value: 'spin', label: 'סיבוב' },
      ];
    }

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.optionButton}
              onPress={() => {
                if (selectionMode === 'color') {
                  handleColorSelection(option.value as CharacterColor);
                } else if (selectionMode === 'skin') {
                  handleSkinSelection(option.value as CharacterSkin);
                } else if (selectionMode === 'animation') {
                  handleAnimationSelection(option.value as CharacterAnimation);
                }
              }}
            >
              <Text style={styles.optionButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setSelectionMode('none')}
          >
            <Text style={styles.cancelButtonText}>ביטול</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCompletedCharacters = () => {
    if (!showCompletedList) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>הדמויות שהשגתי</Text>
          <ScrollView style={styles.completedList}>
            {completedCharacters.length === 0 ? (
              <Text style={styles.emptyText}>עדיין לא השלמת דמויות</Text>
            ) : (
              completedCharacters.map((char) => (
                <View key={char.id} style={styles.completedCharacterItem}>
                  <Text style={styles.completedCharacterText}>
                    {getColorName(char.color)} • {getSkinName(char.skin)} • {getAnimationName(char.animation)}
                  </Text>
                  <Text style={styles.completedCharacterDate}>
                    {new Date(char.completedAt).toLocaleDateString('he-IL')}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCompletedList(false)}
          >
            <Text style={styles.cancelButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>→ חזור</Text>
          </TouchableOpacity>
          <Text style={styles.title}>הדמות שלי</Text>
        </View>

        {/* Character Display */}
        <View style={styles.characterCard}>
          {renderCharacter()}
        </View>

        {/* Stage Info */}
        {renderStageInfo()}

        {/* Completed Characters Button */}
        <TouchableOpacity
          style={styles.completedButton}
          onPress={() => setShowCompletedList(true)}
        >
          <Text style={styles.completedButtonText}>
            🏆 הדמויות שהשגתי ({completedCharacters.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selection Modal */}
      {renderSelectionModal()}

      {/* Completed Characters Modal */}
      {renderCompletedCharacters()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 80 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
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
  },
  characterCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  characterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterEmoji: {
    fontSize: 120,
  },
  skinEmoji: {
    fontSize: 60,
    marginTop: -30,
  },
  stageInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  stageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressBar: {
    marginBottom: 15,
  },
  progressBarBg: {
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#9b59b6',
    borderRadius: 15,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  progressButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  progressButtonDisabled: {
    backgroundColor: '#ccc',
  },
  progressButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  completedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  completedButtonText: {
    color: '#9b59b6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedList: {
    maxHeight: 400,
  },
  completedCharacterItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  completedCharacterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedCharacterDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

