import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store';
import { calculateSettlements } from '../utils/settlement';

export default function TotalsScreen() {
  const { theme } = useTheme();
  const { expenses, people } = useStore();

  const settlements = calculateSettlements(expenses, people);

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || 'Unknown';
  };

  const getPersonColor = (id: string) => {
    return people.find(p => p.id === id)?.color || theme.primary;
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="calculator-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No settlements to show
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Add expenses to see who owes whom
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.summaryIconContainer, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="wallet" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Expenses</Text>
          <Text style={[styles.summaryAmount, { color: theme.text }]}>
            ${totalExpenses.toFixed(2)}
          </Text>
          <Text style={[styles.summarySubtext, { color: theme.textSecondary }]}>
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </Text>
        </View>

        <View style={styles.settlementsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settlements</Text>
          
          {settlements.length === 0 ? (
            <View style={[styles.allSettledCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.allSettledIcon, { backgroundColor: `${theme.success}20` }]}>
                <Ionicons name="checkmark-circle" size={48} color={theme.success} />
              </View>
              <Text style={[styles.allSettledText, { color: theme.success }]}>All Settled!</Text>
              <Text style={[styles.allSettledSubtext, { color: theme.textSecondary }]}>
                Everyone is paid up
              </Text>
            </View>
          ) : (
            settlements.map((settlement, index) => {
              const fromName = getPersonName(settlement.from);
              const toName = getPersonName(settlement.to);
              const fromColor = getPersonColor(settlement.from);
              const toColor = getPersonColor(settlement.to);

              return (
                <View
                  key={index}
                  style={[
                    styles.settlementCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.settlementContent}>
                    <View style={styles.personContainer}>
                      <View style={[styles.personAvatar, { backgroundColor: fromColor }]}>
                        <Text style={styles.avatarText}>
                          {fromName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.personName, { color: theme.text }]}>{fromName}</Text>
                    </View>

                    <View style={styles.arrowContainer}>
                      <Text style={[styles.amount, { color: theme.primary }]}>
                        ${settlement.amount.toFixed(2)}
                      </Text>
                      <Ionicons name="arrow-forward" size={24} color={theme.primary} />
                    </View>

                    <View style={styles.personContainer}>
                      <View style={[styles.personAvatar, { backgroundColor: toColor }]}>
                        <Text style={styles.avatarText}>
                          {toName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.personName, { color: theme.text }]}>{toName}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
  },
  settlementsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settlementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  settlementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personContainer: {
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  allSettledCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  allSettledIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  allSettledText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  allSettledSubtext: {
    fontSize: 14,
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