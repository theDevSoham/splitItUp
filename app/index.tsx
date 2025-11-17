import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store';
import { CATEGORY_ICONS } from '../utils/colors';

export default function ExpensesScreen() {
  const { theme } = useTheme();
  const { expenses, deleteExpense, people } = useStore();

  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || 'Unknown';
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  const renderExpense = ({ item }: { item: typeof expenses[0] }) => {
    const iconName = CATEGORY_ICONS[item.category] || 'ellipsis-horizontal';
    const paidByName = getPersonName(item.paidBy);

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name={iconName as any} size={24} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.description, { color: theme.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.category, { color: theme.textSecondary }]}>
                {item.category}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {item.date} at {item.time}
            </Text>
          </View>

          {item.tag && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {item.tag}
              </Text>
            </View>
          )}

          {item.intent && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {item.intent}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Paid by {paidByName}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.cardFooter}>
          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.amount, { color: theme.primary }]}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.splitsList}>
          {item.splits.map((split, index) => (
            <View key={index} style={styles.splitItem}>
              <Text style={[styles.splitName, { color: theme.text }]}>
                {getPersonName(split.personId)}
              </Text>
              <Text style={[styles.splitAmount, { color: theme.textSecondary }]}>
                ${split.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No expenses yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Add your first expense to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={sortedExpenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  splitsList: {
    marginTop: 8,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  splitName: {
    fontSize: 14,
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '500',
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