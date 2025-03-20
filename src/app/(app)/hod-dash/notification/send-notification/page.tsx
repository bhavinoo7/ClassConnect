"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Info,
  AlertTriangle,
  Send,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAppSelector } from "@/hooks/hooks";

type UserRole = "hod" | "teacher" | "student";
type NotificationType = "info" | "success" | "warning";

interface UserType {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  class?: string;
}

export default function Page() {
  const { hodid } = useAppSelector((state) => state.user);
  const [mockUsers, setMockUsers] = useState<UserType[]>([]);
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("hod");
  const [recipientType, setRecipientType] = useState<"all" | "specific">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [notificationType, setNotificationType] =
    useState<NotificationType>("info");
  const [notificationTitle, setNotificationTitle] = useState<string>("");
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-class", hodid],
    queryFn: async () => {
      try {
        const res = await axios.get(
          "/api/noti-class-fetch-hod?hod_id=" + hodid
        );
        if (res.data.success) {
          setMockUsers(res.data.data);
          return res.data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    },
    enabled: !!hodid,
  });

  // Get unique departments from users
  const departments = Array.from(
    new Set(
      mockUsers.filter((user) => user.department).map((user) => user.department)
    )
  ) as string[];

  // Get unique classes from users
  const classes = Array.from(
    new Set(mockUsers.filter((user) => user.class).map((user) => user.class))
  ) as string[];

  // Get potential recipients based on current user role
  const getPotentialRecipients = () => {
    if (currentUserRole === "hod") {
      // HODs can send to teachers in their department
      return mockUsers.filter(
        (user) =>
          user.role === "teacher" &&
          (selectedDepartment === "" ||
            selectedDepartment === "all" ||
            user.department === selectedDepartment)
      );
    } else if (currentUserRole === "teacher") {
      // Teachers can send to students in their class
      return mockUsers.filter(
        (user) =>
          user.role === "student" &&
          (selectedClass === "" ||
            selectedClass === "all" ||
            user.class === selectedClass)
      );
    }
    return [];
  };

  const potentialRecipients = getPotentialRecipients();

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllRecipients = () => {
    setSelectedRecipients(potentialRecipients.map((user) => user.id));
  };

  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getNotificationColorClass = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "warning":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!notificationTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification title",
        variant: "destructive",
      });
      return;
    }

    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === "specific" && selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would be an API call to send the notification
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const recipients =
        recipientType === "all"
          ? potentialRecipients.map((user) => user.id)
          : selectedRecipients;

      

      const obj = {
        sender: currentUserRole,
        recipients,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        timestamp: new Date(),
      };

      const res = await axios.post("/api/noti-save-hod", { obj, hodid });

      if (res.data.success) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        });

        // Reset form
        setRecipientType("all");
        setSelectedDepartment("");
        setSelectedClass("");
        setSelectedRecipients([]);
        setNotificationType("info");
        setNotificationTitle("");
        setNotificationMessage("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Send Notification</h1>

      <div className="mb-8">
        <Tabs
          value={currentUserRole}
          onValueChange={(value) => {
            setCurrentUserRole(value as UserRole);
            setSelectedDepartment("");
            setSelectedClass("");
            setSelectedRecipients([]);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="hod">Send to Mentors</TabsTrigger>
            <TabsTrigger value="teacher">Send to Students</TabsTrigger>
          </TabsList>

          <TabsContent value="hod">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification to Mentors</CardTitle>
                <CardDescription>
                  As a Head of Department, you can send notifications to mentors
                  in your division.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recipients</h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="department">Division</Label>
                        <Select
                          value={selectedDepartment}
                          onValueChange={setSelectedDepartment}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Division</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <RadioGroup
                        value={recipientType}
                        onValueChange={(value) =>
                          setRecipientType(value as "all" | "specific")
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all-teachers" />
                          <Label htmlFor="all-teachers">
                            All mentor in selected division
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="specific"
                            id="specific-teachers"
                          />
                          <Label htmlFor="specific-teachers">
                            Select specific mentor
                          </Label>
                        </div>
                      </RadioGroup>

                      {recipientType === "specific" && (
                        <div className="border rounded-md p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              Select Recipients
                            </h4>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAllRecipients}
                                className="h-8 text-xs"
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearAllRecipients}
                                className="h-8 text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {potentialRecipients.length > 0 ? (
                              potentialRecipients.map((user) => (
                                <div
                                  key={user.id}
                                  className={cn(
                                    "flex items-center space-x-2 p-2 rounded-md cursor-pointer border",
                                    selectedRecipients.includes(user.id)
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-muted"
                                  )}
                                  onClick={() => toggleRecipient(user.id)}
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.department}
                                    </p>
                                  </div>
                                  <div className="h-4 w-4 rounded-sm border flex items-center justify-center">
                                    {selectedRecipients.includes(user.id) && (
                                      <CheckCircle className="h-3 w-3 text-primary" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 flex items-center justify-center p-4 text-muted-foreground">
                                No teachers found in the selected division
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            {selectedRecipients.length} teacher(s) selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notification Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notification-type">
                          Notification Type
                        </Label>
                        <Select
                          value={notificationType}
                          onValueChange={(value) =>
                            setNotificationType(value as NotificationType)
                          }
                        >
                          <SelectTrigger id="notification-type">
                            <SelectValue placeholder="Select notification type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 text-blue-500 mr-2" />
                                Information
                              </div>
                            </SelectItem>
                            <SelectItem value="success">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Success
                              </div>
                            </SelectItem>
                            <SelectItem value="warning">
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                Warning
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notification-title">Title</Label>
                        <Input
                          id="notification-title"
                          placeholder="Enter notification title"
                          value={notificationTitle}
                          onChange={(e) => setNotificationTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notification-message">Message</Label>
                        <Textarea
                          id="notification-message"
                          placeholder="Enter notification message"
                          value={notificationMessage}
                          onChange={(e) =>
                            setNotificationMessage(e.target.value)
                          }
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preview</h3>

                    <div
                      className={cn(
                        "border rounded-lg p-4",
                        getNotificationColorClass(notificationType)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notificationType)}
                        <div className="space-y-1">
                          <p className="font-medium">
                            {notificationTitle || "Notification Title"}
                          </p>
                          <p className="text-sm">
                            {notificationMessage ||
                              "Notification message will appear here"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <span>From: HOD</span>
                            <span>{new Date().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification to Students</CardTitle>
                <CardDescription>
                  As a Hod, you can send notifications to students in your
                  class.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recipients</h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="class">Class</Label>
                        <Select
                          value={selectedClass}
                          onValueChange={setSelectedClass}
                        >
                          <SelectTrigger id="class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <RadioGroup
                        value={recipientType}
                        onValueChange={(value) =>
                          setRecipientType(value as "all" | "specific")
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all-students" />
                          <Label htmlFor="all-students">
                            All students in selected class
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="specific"
                            id="specific-students"
                          />
                          <Label htmlFor="specific-students">
                            Select specific students
                          </Label>
                        </div>
                      </RadioGroup>

                      {recipientType === "specific" && (
                        <div className="border rounded-md p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              Select Recipients
                            </h4>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAllRecipients}
                                className="h-8 text-xs"
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearAllRecipients}
                                className="h-8 text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                            {potentialRecipients.length > 0 ? (
                              potentialRecipients.map((user) => (
                                <div
                                  key={user.id}
                                  className={cn(
                                    "flex items-center space-x-2 p-2 rounded-md cursor-pointer border",
                                    selectedRecipients.includes(user.id)
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-muted"
                                  )}
                                  onClick={() => toggleRecipient(user.id)}
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.class}
                                    </p>
                                  </div>
                                  <div className="h-4 w-4 rounded-sm border flex items-center justify-center">
                                    {selectedRecipients.includes(user.id) && (
                                      <CheckCircle className="h-3 w-3 text-primary" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 flex items-center justify-center p-4 text-muted-foreground">
                                No students found in the selected class
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            {selectedRecipients.length} student(s) selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notification Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notification-type-teacher">
                          Notification Type
                        </Label>
                        <Select
                          value={notificationType}
                          onValueChange={(value) =>
                            setNotificationType(value as NotificationType)
                          }
                        >
                          <SelectTrigger id="notification-type-teacher">
                            <SelectValue placeholder="Select notification type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 text-blue-500 mr-2" />
                                Information
                              </div>
                            </SelectItem>
                            <SelectItem value="success">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Success
                              </div>
                            </SelectItem>
                            <SelectItem value="warning">
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                Warning
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notification-title-teacher">
                          Title
                        </Label>
                        <Input
                          id="notification-title-teacher"
                          placeholder="Enter notification title"
                          value={notificationTitle}
                          onChange={(e) => setNotificationTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notification-message-teacher">
                          Message
                        </Label>
                        <Textarea
                          id="notification-message-teacher"
                          placeholder="Enter notification message"
                          value={notificationMessage}
                          onChange={(e) =>
                            setNotificationMessage(e.target.value)
                          }
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preview</h3>

                    <div
                      className={cn(
                        "border rounded-lg p-4",
                        getNotificationColorClass(notificationType)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notificationType)}
                        <div className="space-y-1">
                          <p className="font-medium">
                            {notificationTitle || "Notification Title"}
                          </p>
                          <p className="text-sm">
                            {notificationMessage ||
                              "Notification message will appear here"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <span>From: Teacher</span>
                            <span>{new Date().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
