"use client";

import { useState } from "react";
import { CheckCircle2, InboxIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

export default function Page() {
  const [initialRequests, setinitialRequests] = useState([]);
  const { division_id } = useAppSelector((state) => state.timetable);
  const [pendingRequests, setPendingRequests] = useState<
    {
      id: string;
      title: string;
      requester: string;
      department: string;
      requestDate: string;
      status: string;
      enroll_no: string;
    }[]
  >(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    title: string;
    requester: string;
    status: string;
    enroll_no: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastApproved, setLastApproved] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isMultipleApproval, setIsMultipleApproval] = useState(false);

  const handleAcceptSelectedClick = () => {
    if (selectedRequests.length === 0) return;

    setIsMultipleApproval(true);
    setIsDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (isMultipleApproval) {
      // Handle multiple approvals
      const approvedCount = selectedRequests.length;

      const response = await axios.post("/api/accept-req", {
        student_id: selectedRequests,
        division_id,
      });

      if (response.data.success) {
        // Remove all selected requests from the pending list
        setPendingRequests(
          pendingRequests.filter((req) => !selectedRequests.includes(req.id))
        );

        // Set success message for multiple approvals
        setLastApproved(
          `${approvedCount} request${approvedCount > 1 ? "s" : ""}`
        );
        // Clear selections
        setSelectedRequests([]);
      }
    } else {
      // Handle single approval
      setLastApproved(selectedRequest?.requester || "");

      // Remove the approved request from the pending list
      if (selectedRequest) {
        setPendingRequests(
          pendingRequests.filter((req) => req.id !== selectedRequest.id)
        );

        // Also remove from selected if it was selected
        if (selectedRequests.includes(selectedRequest.id)) {
          setSelectedRequests(
            selectedRequests.filter((id) => id !== selectedRequest.id)
          );
        }
      }
    }

    setIsDialogOpen(false);
    setShowSuccess(true);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const toggleSelectRequest = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id)
        ? prev.filter((requestId) => requestId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRequests.length === pendingRequests.length) {
      // If all are selected, unselect all
      setSelectedRequests([]);
    } else {
      // Otherwise, select all
      setSelectedRequests(pendingRequests.map((req) => req.id));
    }
  };

  // Empty state when no pending requests
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-primary-50 p-4 rounded-full mb-4">
        <InboxIcon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">No pending requests</h3>
      <p className="text-muted-foreground max-w-sm">
        All requests have been processed. New requests will appear here when
        they are submitted.
      </p>
    </div>
  );

  const { isLoading, data, error } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/fetch-request?division_id=" + division_id
      );
      const r = response.data.data.map((s: any) => {
        return {
          id: s.student_id,
          title: "Access Request",
          requester: s.student_name,
          status: "pending",
          enroll_no: s.enroll_no,
        };
      });

      setPendingRequests(r);
      return response.data;
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Requests</h2>
        {pendingRequests.length > 0 && selectedRequests.length > 0 && (
          <Button onClick={handleAcceptSelectedClick}>
            Accept Selected ({selectedRequests.length})
          </Button>
        )}
      </div>

      {showSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {isMultipleApproval
              ? `${lastApproved} have been approved successfully.`
              : `The request from ${lastApproved} has been approved successfully.`}
          </AlertDescription>
        </Alert>
      )}

      {pendingRequests.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRequests.length === pendingRequests.length &&
                      pendingRequests.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map(
                (request: {
                  enroll_no: string;
                  id: string;
                  title: string;
                  requester: string;
                  status: string;
                }) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => toggleSelectRequest(request.id)}
                        aria-label={`Select request ${request.id}`}
                      />
                    </TableCell>

                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.enroll_no}</TableCell>
                    <TableCell>{request.requester}</TableCell>

                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Acceptance</DialogTitle>
            <DialogDescription>
              {isMultipleApproval
                ? `Are you sure you want to approve ${
                    selectedRequests.length
                  } selected request${
                    selectedRequests.length > 1 ? "s" : ""
                  }? This action cannot be undone.`
                : `Are you sure you want to approve the request from ${selectedRequest?.requester}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAccept}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
