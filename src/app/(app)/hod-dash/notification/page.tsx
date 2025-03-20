"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Filter, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/hooks";
import axios from "axios";
import { useAppDispatch } from "@/hooks/hooks";
import { NotificationActions } from "@/store/slice/notification";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type NotificationType = "info" | "success" | "warning";
type NotificationSource = "teacher" | "hod" | "student";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  sender: string;
  type: NotificationType;
  read: boolean;
  source: NotificationSource;
  recipient: NotificationSource;
  recipients?: string[]; // Add this line
}

export default function Page() {
  const dispatch = useAppDispatch();
  const { hodid } = useAppSelector((state) => state.user);
  const [notifications, setNotificat] = useState<Notification[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axios.get("/api/noti-fetch-hod?hod_id=" + hodid);

      setNotificat(response.data.data);
      dispatch(NotificationActions.setNotification(response.data.data));

      return response.data;
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [currentRole, setCurrentRole] = useState<"teacher" | "student">(
    "teacher"
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sentByTeacherNotifications = notifications?.filter(
    (n) => n.source === "teacher"
  );
  const hodNotifications = notifications?.filter((n) => n.source === "hod");

  const teacherSentUnreadCount = sentByTeacherNotifications?.filter(
    (n) => !n.read
  ).length;
  const hodUnreadCount = hodNotifications?.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotificat((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = (source: NotificationSource) => {
    setNotificat((prev) =>
      prev.map((notification) =>
        notification.source === source
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotificat((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "Invalid Date"; // Handle null/undefined cases

    const validDate = date instanceof Date ? date : new Date(date);

    if (isNaN(validDate.getTime())) return "Invalid Date"; // Handle invalid date cases

    return validDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Example usage:
  const notification = {
    timestamp: "2025-03-18T13:39:32.790Z", // Ensure this is a valid date string
  };

  const formatTime = (date: string | Date) => {
    const validDate = date instanceof Date ? date : new Date(date);

    if (isNaN(validDate.getTime())) return "Invalid Date";

    return validDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "bg-blue-500";
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "Information";
      case "success":
        return "Success";
      case "warning":
        return "Warning";
      default:
        return "Information";
    }
  };

  const filterNotifications = (notifications: Notification[]) => {
    return notifications
      ?.filter((notification) => {
        // Apply search filter
        if (
          searchQuery &&
          !notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !notification.message
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !notification.sender.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Apply type filter
        if (filterType !== "all" && notification.type !== filterType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error("Invalid date:", a.timestamp, b.timestamp);
          return 0; // Keep the order unchanged if dates are invalid
        }

        return sortOrder === "newest"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
  };

  const filteredTeacherSentNotifications = filterNotifications(
    sentByTeacherNotifications
  );
  const filteredHodNotifications = filterNotifications(hodNotifications);

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);

    // Mark as read when viewed
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Link href="notification/send-notification" passHref>
          <Button className="mt-4 md:mt-0">Send New Notification</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Information</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        defaultValue="teacher"
        className="w-full"
        onValueChange={(value) =>
          setCurrentRole(value as "teacher" | "student")
        }
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="teacher" className="relative">
            Student Sent Notifications
            {teacherSentUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {teacherSentUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="student" className="relative">
            Mentor Sent Notifications
            {hodUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {hodUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teacher">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Student Sent Notifications</CardTitle>
                <CardDescription>
                  Notifications sent by hod with recipient information
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTeacherSentNotifications?.length > 0 ? (
                <div className="space-y-4">
                  {filteredTeacherSentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border rounded-lg transition-colors",
                        !notification.read
                          ? "bg-muted/20 border-muted-foreground/20"
                          : "border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-3 w-3 mt-1.5 rounded-full flex-shrink-0",
                            getNotificationColor(notification.type)
                          )}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-base">
                                {notification.title}
                              </p>
                              <p className="text-sm mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  From: {notification.sender}
                                </p>
                              </div>
                              {notification.recipients &&
                                notification.recipients.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        Recipients:
                                      </span>{" "}
                                      {notification.recipients.join(", ")}
                                    </p>
                                  </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end text-sm text-muted-foreground">
                              <span>{formatTime(notification.timestamp)}</span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                viewNotificationDetails(notification)
                              }
                              className="h-8 px-2 text-xs"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || filterType !== "all"
                      ? "Try adjusting your search or filter settings"
                      : "You're all caught up!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mentor Sent Notifications</CardTitle>
                <CardDescription>
                  Notifications sent by hod with recipient information
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHodNotifications?.length > 0 ? (
                <div className="space-y-4">
                  {filteredHodNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border rounded-lg transition-colors",
                        !notification.read
                          ? "bg-muted/20 border-muted-foreground/20"
                          : "border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-3 w-3 mt-1.5 rounded-full flex-shrink-0",
                            getNotificationColor(notification.type)
                          )}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-base">
                                {notification.title}
                              </p>
                              <p className="text-sm mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  From: {notification.sender}
                                </p>
                              </div>
                              {notification.recipients &&
                                notification.recipients.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        Recipients:
                                      </span>{" "}
                                      {notification.recipients.join(", ")}
                                    </p>
                                  </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end text-sm text-muted-foreground">
                              <span>{formatTime(notification.timestamp)}</span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                viewNotificationDetails(notification)
                              }
                              className="h-8 px-2 text-xs"
                            >
                              View
                            </Button>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 px-2 text-xs"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">
                    No notifications found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery || filterType !== "all"
                      ? "Try adjusting your search or filter settings"
                      : "You're all caught up!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Notification Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full flex-shrink-0",
                      getNotificationColor(selectedNotification.type)
                    )}
                  />
                  <DialogTitle className="text-xl">
                    {selectedNotification.title}
                  </DialogTitle>
                </div>
                <DialogDescription className="flex justify-between items-center mt-2">
                  <span>From: {selectedNotification.sender}</span>
                  <span>
                    {formatDate(selectedNotification.timestamp)} at{" "}
                    {formatTime(selectedNotification.timestamp)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 border-t pt-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>
              </div>

              {selectedNotification.recipients &&
                selectedNotification.recipients.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Recipients:</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">
                        {selectedNotification.recipients.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

              <DialogFooter className="mt-6">
                <Badge variant="outline" className="mr-auto">
                  {getNotificationTypeLabel(selectedNotification.type)}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
