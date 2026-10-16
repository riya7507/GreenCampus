import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { ApiService } from "@/services/api";

interface IssueUpdate {
  id: number;
  status: string;
  comment?: string;
  created_at: string;
  updater_name?: string;
}

interface IssueDetail {
  id: number;
  issue_type: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  reported_by_id: number;
  reporter_name?: string;
  updates?: IssueUpdate[];
}

export default function IssueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("in_progress");
  const [statusComment, setStatusComment] = useState<string>("");
  const [waterSaved, setWaterSaved] = useState<string>("25");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const issueId = Number(id);

  const fetchIssue = async () => {
    if (!issueId) return;
    try {
      setError(null);
      const data = await ApiService.getIssueById(issueId);
      setIssue(data);
      if (data?.status === "reported") {
        setNewStatus("in_progress");
      } else if (data?.status === "in_progress") {
        setNewStatus("resolved");
      }
    } catch {
      setError("Unable to load issue details.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchIssue();
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await ApiService.updateIssueStatus(issueId, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
        estimated_water_saved:
          issue?.issue_type === "water" && newStatus === "resolved"
            ? Number(waterSaved) || 25
            : undefined,
      });

      setShowStatusModal(false);
      setStatusComment("");
      Alert.alert(
        "Status Updated",
        `Issue has been marked as ${newStatus.replace("_", " ")}.`,
      );
      fetchIssue();
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.message || "Could not update issue status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status?: string | null) => {
    const normalizedStatus = (status ?? "reported").toLowerCase();

    switch (normalizedStatus) {
      case "resolved":
        return { bg: "#E8F5E9", text: "#2E7D32", label: "RESOLVED" };

      case "in_progress":
        return { bg: "#E3F2FD", text: "#1976D2", label: "IN PROGRESS" };

      case "reported":
      default:
        return { bg: "#FFF8E1", text: "#F57F17", label: "REPORTED" };
    }
  };

  const getEmoji = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "water":
        return "💧";
      case "electricity":
        return "⚡";
      case "waste":
        return "♻️";
      default:
        return "⚠️";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !issue) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Issue Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || "Issue not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(issue.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Issue #{issue.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#2E7D32"
          />
        }
      >
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.typeRow}>
            <View style={styles.typeLeft}>
              <Text style={styles.typeEmoji}>{getEmoji(issue.issue_type)}</Text>
              <Text style={styles.typeText}>
                {issue.issue_type.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          <Text style={styles.descText}>{issue.description}</Text>

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>📍 Location:</Text>
            <Text style={styles.metaValue}>{issue.location}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>📅 Reported:</Text>
            <Text style={styles.metaValue}>
              {new Date(issue.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action button to update status */}
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowStatusModal(true)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionButtonText}>Update Progress / Resolve</Text>
        </Pressable>

        {/* Audit Timeline / Updates */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Timeline & Progress</Text>
        </View>

        {issue.updates && issue.updates.length > 0 ? (
          <View style={styles.timelineList}>
            {issue.updates.map((up) => {
              const upBadge = getStatusBadge(up.status);

              return (
                <View key={up.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View
                        style={[
                          styles.miniBadge,
                          { backgroundColor: upBadge.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniBadgeText,
                            { color: upBadge.text },
                          ]}
                        >
                          {upBadge.label}
                        </Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {new Date(up.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {up.comment ? (
                      <Text style={styles.timelineComment}>{up.comment}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyTimeline}>
            <Text style={styles.emptyTimelineText}>
              No progress updates logged yet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Issue Status</Text>

            <View style={styles.modalStatusRow}>
              {["reported", "in_progress", "resolved"].map((st) => (
                <Pressable
                  key={st}
                  onPress={() => setNewStatus(st)}
                  style={[
                    styles.modalStatusBtn,
                    newStatus === st && styles.modalStatusBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalStatusBtnText,
                      newStatus === st && styles.modalStatusBtnTextActive,
                    ]}
                  >
                    {st.replace("_", " ").toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {newStatus === "resolved" && issue.issue_type === "water" && (
              <View style={styles.modalField}>
                <Text style={styles.modalFieldLabel}>
                  Estimated Water Saved (Litres):
                </Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={waterSaved}
                  onChangeText={setWaterSaved}
                />
              </View>
            )}

            <View style={styles.modalField}>
              <Text style={styles.modalFieldLabel}>
                Update Notes / Comments:
              </Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="e.g., Plumber repaired leaking valve in restroom."
                placeholderTextColor="#90A4AE"
                value={statusComment}
                onChangeText={setStatusComment}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowStatusModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleUpdateStatus}
                disabled={isUpdating}
                style={styles.modalSaveBtn}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Update</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAF8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F8E9",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: { fontSize: 20, color: "#2E7D32", fontWeight: "bold" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#263238" },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
    gap: Spacing.three,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEFF1",
    gap: 12,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeEmoji: { fontSize: 20 },
  typeText: { fontSize: 14, fontWeight: "800", color: "#263238" },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  descText: { fontSize: 15, color: "#37474F", lineHeight: 22 },
  metaDivider: { height: 1, backgroundColor: "#ECEFF1" },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  metaLabel: { fontSize: 12, fontWeight: "700", color: "#78909C" },
  metaValue: { fontSize: 12, color: "#263238", flex: 1, fontWeight: "500" },
  actionButton: {
    backgroundColor: "#00897B",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  sectionHeader: { marginTop: Spacing.one },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#263238" },
  timelineList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEFF1",
    gap: 14,
  },
  timelineItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
    marginTop: 5,
  },
  timelineContent: { flex: 1, gap: 4 },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniBadgeText: { fontSize: 9, fontWeight: "800" },
  timelineDate: { fontSize: 10, color: "#90A4AE" },
  timelineComment: { fontSize: 12, color: "#546E7A", marginTop: 2 },
  emptyTimeline: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEFF1",
  },
  emptyTimelineText: { fontSize: 12, color: "#78909C" },
  centerBox: { padding: 40, alignItems: "center" },
  errorBox: {
    margin: 20,
    padding: 14,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
  },
  errorText: { color: "#C62828", textAlign: "center", fontSize: 13 },
  pressed: { opacity: 0.8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#263238" },
  modalStatusRow: { flexDirection: "row", gap: 8 },
  modalStatusBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  modalStatusBtnActive: { backgroundColor: "#2E7D32" },
  modalStatusBtnText: { fontSize: 11, fontWeight: "700", color: "#546E7A" },
  modalStatusBtnTextActive: { color: "#FFFFFF" },
  modalField: { gap: 4 },
  modalFieldLabel: { fontSize: 12, fontWeight: "700", color: "#37474F" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 60,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#ECEFF1",
  },
  modalCancelText: { color: "#546E7A", fontWeight: "700" },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#2E7D32",
  },
  modalSaveText: { color: "#FFFFFF", fontWeight: "700" },
});
