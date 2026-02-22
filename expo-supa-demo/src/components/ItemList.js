import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

function ItemRow({ item }) {
  const dateLabel = new Date(item.created_at).toLocaleString();

  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title}</Text>
      <Text style={styles.rowDate}>{dateLabel}</Text>
    </View>
  );
}

export function ItemList({ items }) {
  if (!items.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No rows yet</Text>
        <Text style={styles.emptyCopy}>Add your first row to see data from Supabase here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => <ItemRow item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 10,
    paddingBottom: 20
  },
  row: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    padding: 12,
    gap: 4
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a"
  },
  rowDate: {
    color: "#475569",
    fontSize: 12
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    padding: 16,
    alignItems: "center",
    gap: 4
  },
  emptyTitle: {
    fontWeight: "600",
    color: "#334155"
  },
  emptyCopy: {
    color: "#64748b",
    textAlign: "center"
  }
});
