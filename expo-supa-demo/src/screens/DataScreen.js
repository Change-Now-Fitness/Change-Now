import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ItemList } from "../components/ItemList";
import { supabase } from "../lib/supabase";

const TABLE_NAME = "demo_items";

export function DataScreen({ session }) {
  const [newTitle, setNewTitle] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("Loading data...");

  useEffect(() => {
    // Load rows when this screen first appears.
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setInfoMessage(`Could not load rows: ${error.message}`);
        return;
      }

      setItems(data || []);
      setInfoMessage(data?.length ? "Rows loaded from Supabase." : "No rows yet. Add one below.");
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    const title = newTitle.trim();

    if (!title) {
      setInfoMessage("Type a title before adding an item.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from(TABLE_NAME).insert({
        // Store owner id so RLS policies can enforce per-user access.
        user_id: session.user.id,
        title
      });

      if (error) {
        setInfoMessage(`Could not insert row: ${error.message}`);
        return;
      }

      setNewTitle("");
      setInfoMessage("Row added.");
      await loadItems();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setInfoMessage(`Sign out failed: ${error.message}`);
      return;
    }

    setInfoMessage("Signed out.");
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Supabase Data</Text>
          <Text style={styles.userEmail}>{session?.user?.email}</Text>
        </View>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={styles.addCard}>
        <Text style={styles.cardTitle}>Add row to {TABLE_NAME}</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: My first row"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, loading && styles.buttonDisabled]} onPress={addItem} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? "Working..." : "Add Item"}</Text>
          </Pressable>
          <Pressable style={[styles.secondaryAction, loading && styles.buttonDisabled]} onPress={loadItems} disabled={loading}>
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.message}>{infoMessage}</Text>
      <ItemList items={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a"
  },
  userEmail: {
    color: "#475569",
    marginTop: 2
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  signOutText: {
    color: "#b91c1c",
    fontWeight: "600"
  },
  addCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  cardTitle: {
    color: "#334155",
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  actionRow: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center"
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center"
  },
  secondaryActionText: {
    color: "#1d4ed8",
    fontWeight: "600"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  message: {
    color: "#334155"
  }
});
