"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { USERS } from "@/@types/user";
import { updateUSER_ADMIN } from "@/services/operations/adminOperations/allUsers";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useRouter } from "next/navigation";

interface ViewUserDialogProps {
  open: boolean;
  user: USERS;
  onOpenChange: (open: boolean) => void;
  fetchUsers: () => Promise<void>;
}

export default function ViewUserDialog({
  open,
  user,
  onOpenChange,
  fetchUsers,
}: ViewUserDialogProps) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);

  const handleSave = async () => {
    if (!token) {
      toast.error("Unauthorized");
      router.push("/auth/sign-in");
      return;
    }
    try {
      setLoading(true);
      const updatedData = { status, role };
      console.log("Updating User:", updatedData);

      const response = await updateUSER_ADMIN(user._id, token, updatedData);

      if (!response) {
        toast.error("Failed to update user");
        return;
      }
      toast.success("User updated successfully");
      onOpenChange(false);
      fetchUsers(); // Optional: Refresh table after update
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-11/12 md:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <Label>Name</Label>
            <Input
              value={user.fname + " " + user.lname}
              readOnly
              className="bg-gray-100 mt-2 cursor-no-drop"
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              value={user.email}
              readOnly
              className="bg-gray-100 mt-2 cursor-no-drop"
            />
          </div>

          {/* Mobile */}
          <div>
            <Label>Mobile</Label>
            <Input
              value={user.phone}
              readOnly
              className="bg-gray-100 mt-2 cursor-no-drop"
            />
          </div>

          <div className="flex gap-4">
            {/* Status */}
            <div className="w-full">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="w-full">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-red-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
