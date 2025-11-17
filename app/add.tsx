import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/colors';

export default function AddExpenseScreen() {
  const { theme } = useTheme();
  const { people, addExpense } = useStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tag, setTag] = useState('');
  const [intent, setIntent] = useState('');
  const [paidBy, setPaidBy] = useState(people[0]?.id || '');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(
    people.map(p => p.id)
  );
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});
  const [isCustomSplit, setIsCustomSplit] = useState(false);

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || '';
  };

  const togglePersonSelection = (personId: string) => {
    if (selectedPeople.includes(personId)) {
      setSelectedPeople(selectedPeople.filter(id => id !== personId));
    } else {
      setSelectedPeople([...selectedPeople, personId]);
    }
  };

  const calculateEqualSplit = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || selectedPeople.length === 0) return {};

    const splitAmount = amountNum / selectedPeople.length;
    const splits: { [key: string]: string } = {};
    selectedPeople.forEach(id => {
      splits[id] = splitAmount.toFixed(2);
    });
    return splits;
  };

  const updateCustomSplit = (personId: string, value: string) => {
    setCustomSplits({
      ...customSplits,
      [personId]: value,
    });
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (selectedPeople.length === 0) {
      Alert.alert('Error', 'Please select at least one person');
      return;
    }

    if (!paidBy) {
      Alert.alert('Error', 'Please select who paid');
      return;
    }

    // Calculate splits
    let splits;
    if (isCustomSplit) {
      splits = selectedPeople.map(id => ({
        personId: id,
        amount: parseFloat(customSplits[id] || '0'),
      }));

      const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalSplit - amountNum) > 0.01) {
        Alert.alert(
          'Error',
          `Split amounts (${totalSplit.toFixed(2)}) don't match total amount (${amountNum.toFixed(2)})`
        );
        return;
      }
    } else {
      const equalSplits = calculateEqualSplit();
      splits = selectedPeople.map(id => ({
        personId: id,
        amount: parseFloat(equalSplits[id] || '0'),
      }));
    }

    const expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: amountNum,
      date: format(new Date(), 'MMM dd, yyyy'),
      time: format(new Date(), 'hh:mm a'),
      category,
      tag: tag.trim(),
      intent: intent.trim(),
      splits,
      paidBy,
    };

    addExpense(expense);

    // Reset form
    setDescription('');
    setAmount('');
    setTag('');
    setIntent('');
    setCategory(CATEGORIES[0]);
    setSelectedPeople(people.map(p => p.id));
    setCustomSplits({});
    setIsCustomSplit(false);

    Alert.alert('Success', 'Expense added successfully!');
  };

  if (people.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No people added
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Add people first to create expenses
          </Text>
        </View>
      </View>
    );
  }

  const currentSplits = isCustomSplit ? customSplits : calculateEqualSplit();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., Lunch at restaurant"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Amount *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  const iconName = CATEGORY_ICONS[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.card,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : theme.text}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Tag */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Tag</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., Weekend, Business"
              placeholderTextColor={theme.textSecondary}
              value={tag}
              onChangeText={setTag}
            />
          </View>

          {/* Intent */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Intent/Purpose</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="e.g., Team building, Birthday celebration"
              placeholderTextColor={theme.textSecondary}
              value={intent}
              onChangeText={setIntent}
            />
          </View>

          {/* Paid By */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Paid By *</Text>
            <View style={styles.peopleGrid}>
              {people.map((person) => {
                const isSelected = paidBy === person.id;
                return (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => setPaidBy(person.id)}
                    style={[
                      styles.personChip,
                      {
                        backgroundColor: isSelected ? person.color : theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.personChipText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {person.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Split Between */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Split Between *</Text>
            <View style={styles.peopleGrid}>
              {people.map((person) => {
                const isSelected = selectedPeople.includes(person.id);
                return (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => togglePersonSelection(person.id)}
                    style={[
                      styles.personChip,
                      {
                        backgroundColor: isSelected ? person.color : theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.personChipText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {person.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Custom Split Toggle */}
          <TouchableOpacity
            onPress={() => setIsCustomSplit(!isCustomSplit)}
            style={[styles.toggleButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.toggleText, { color: theme.text }]}>
              {isCustomSplit ? 'Equal Split' : 'Custom Split'}
            </Text>
            <Ionicons
              name={isCustomSplit ? 'toggle' : 'toggle-outline'}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>

          {/* Split Amounts */}
          {selectedPeople.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>Split Amounts</Text>
              {selectedPeople.map((personId) => {
                const person = people.find(p => p.id === personId);
                if (!person) return null;

                return (
                  <View
                    key={personId}
                    style={[
                      styles.splitRow,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.splitPersonInfo}>
                      <View style={[styles.miniAvatar, { backgroundColor: person.color }]}>
                        <Text style={styles.miniAvatarText}>
                          {person.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.splitPersonName, { color: theme.text }]}>
                        {person.name}
                      </Text>
                    </View>
                    {isCustomSplit ? (
                      <TextInput
                        style={[
                          styles.splitInput,
                          {
                            backgroundColor: theme.background,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                        placeholder="0.00"
                        placeholderTextColor={theme.textSecondary}
                        value={customSplits[personId] || ''}
                        onChangeText={(value) => updateCustomSplit(personId, value)}
                        keyboardType="decimal-pad"
                      />
                    ) : (
                      <Text style={[styles.splitAmount, { color: theme.primary }]}>
                        ${currentSplits[personId] || '0.00'}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  personChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  splitPersonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  splitPersonName: {
    fontSize: 16,
    fontWeight: '500',
  },
  splitInput: {
    width: 100,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    textAlign: 'right',
  },
  splitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});