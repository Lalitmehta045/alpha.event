"use client";
import { use, useEffect, useState } from "react";

import { RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import LayoutV1 from "../../layout/layoutV1";
import { FaEdit } from "react-icons/fa";
import LoadingPage from "./loading";
import { deleteAddress, getAllAddress } from "@/services/operations/address";
import toast from "react-hot-toast";
import AddAddressDialog from "@/components/common/address/AddAddressDialog";
import EditAddressDialog from "@/components/common/address/EditAddressDialog";
import ConfirmDeleteDialog from "@/components/common/Dialogs/ConfirmDialog";
import { MdDelete } from "react-icons/md";
import { getProfileDetail, updateProfile } from "@/services/operations/profile";
import { uploadToS3 } from "@/services/operations/upload";
import { ClipLoader } from "react-spinners";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = use(params); // ✔ Correct usage
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const profile: any = useSelector((state: RootState) => state.profile.profile);
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    avatar: "",
    phone: "", // New state for phone number
  });

  const [passFormData, setPassFormData] = useState({
    newPassword: "", // New state for password
    confirmPassword: "", // New state for confirm password
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const addressList = useSelector(
    (state: RootState) => state.address.addresses
  );

  useEffect(() => {
    if (profile) {
      setUser(profile);
      setFormData({
        fname: profile.fname,
        lname: profile.lname,
        avatar: profile.avatar || "",
        email: profile.email,
        phone: profile.phone || "",
      });
    }
    setLoading(false);
  }, [profile]);

  const fetchAddress = async () => {
    try {
      const mappedAddress = await getAllAddress(dispatch);
      // console.log("mappedAddress: ", mappedAddress);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load address data");
    }
  };

  const handleDeleteAddress = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    if (!deleteAddressId) return;
    try {
      await deleteAddress(deleteAddressId, token, dispatch);

      fetchAddress();
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to delete address");
    } finally {
      toast.success("Address deleted successfully");
    }
  };

  const fetchProfileDetails = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    try {
      const getProfile = await getProfileDetail(id, token, dispatch);
      // console.log("getProfile: ", getProfile);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load getProfile data");
    }
  };

  const handleUploadAvatarImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);

      // Upload to S3
      const url = await uploadToS3(file);

      if (url) {
        setFormData((prev) => ({
          ...prev,
          avatar: url, // ← Save URL correctly
        }));

        toast.success("Avatar Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Avatar Image upload error:", err);
      toast.error("Avatar Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
    fetchProfileDetails();
  }, [id]);

  // ===================== NEW LOADING UI =====================
  if (loading) return <LoadingPage />;

  // ===================== UPDATED NO USER UI =====================
  if (!user)
    return (
      <div className="w-11/12 flex justify-center items-center h-screen bg-gray-50">
        <div className="p-12 text-center bg-white rounded-xl shadow-2xl border-t-4 border-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-red-700">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-600">
            We couldn't find a user profile associated with this ID.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg shadow transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );

  // Handlers (kept as is, logging to console)
  const handleUpdateUser = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    try {
      const editProfile = await updateProfile(id, formData, token, dispatch);
      // console.log("editProfile: ", editProfile);
      fetchProfileDetails();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load editProfile data");
    } finally {
      toast.success("Your Profile Update Successfully.");
    }
  };

  const handleUpdatePassword = () => {
    // Logic for updating password
    console.log("Update password API call", {
      newPassword: passFormData.newPassword,
      confirmPassword: passFormData.confirmPassword,
    });
  };

  const handleUpdatePhone = () => {
    // Logic for updating/verifying phone number
    console.log("Update phone API call", formData.phone);
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-50 font-sans">
      <LayoutV1>
        <main className="max-w-11/12 mx-auto w-full px-4 md:px-6 mt-20 md:mt-24 py-10 flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-gray-800 border-b-3 border-dotted border-gray-800 pb-2">
            My Account
          </h1>

          {/* ================= PROFILE & SECURITY LAYOUT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Span 2 for wider content) */}
            <div className="lg:col-span-2 space-y-8">
              {/* ================= PROFILE UPDATE SECTION ================= */}
              <section className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Personal Information
                </h2>

                {/* Avatar and URL Input */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-4 border-b">
                  <div className="relative mx-auto md:mx-0">
                    {/* Replaced Next.js Image with standard HTML <img> to fix build error */}

                    <img
                      src={formData.avatar || "/assets/images/User3.png"}
                      width={100}
                      height={90}
                      alt="avatar"
                      className="rounded-full object-cover border-4 border-blue-100 shadow-md"
                    />
                    {/* REQUIRED: User Role Status Circle */}
                    <div className="absolute bottom-1 right-2 h-5 w-5 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
                      <span
                        className="text-xs text-white"
                        title={`Role: ${user.role || "USER"}`}
                      >
                        {/* You can add a small icon or just color based on role */}
                      </span>
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar URL
                    </label>
                    {imageUploading ? (
                      <ClipLoader size={30} color="#3b82f6" />
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAvatarImage}
                        className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Editable Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.fname ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fname: e.target.value })
                      }
                      className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lname ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, lname: e.target.value })
                      }
                      className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                    />
                  </div>
                </div>

                {/* Email Display Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email ID:
                    </label>
                    <input
                      type="text"
                      value={formData.email ?? ""}
                      disabled
                      className="border border-gray-300 bg-gray-100 cursor-not-allowed rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateUser}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-colors transform hover:scale-[1.01] active:scale-100"
                >
                  Save Profile Changes
                </button>
              </section>

              {/* ================= ADDRESS SECTION (Full Width) ================= */}
              <section className="bg-white shadow-xl rounded-2xl p-8 space-y-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-stretch gap-3 justify-between border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => setOpen(true)}
                    className="bg-gray-800 cursor-pointer hover:bg-gray-900 text-white px-4 py-2 text-sm rounded-lg font-medium shadow-md transition-colors"
                  >
                    + Add New Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addressList?.length === 0 ? (
                    <p className="text-gray-500 italic py-4">
                      No addresses saved. Click "Add New Address" to get
                      started.
                    </p>
                  ) : (
                    addressList.map((address, index: number) =>
                      address.status ? (
                        <label
                          key={address._id || index}
                          htmlFor={`address-${index}`}
                          className="block mt-2"
                        >
                          <div className="border border-dashed border-gray-400 rounded-lg p-4 flex justify-between items-start gap-4 hover:bg-blue-50 cursor-pointer transition">
                            <div className="flex items-start gap-3">
                              {/* Radio Button */}
                              <input
                                id={`address-${index}`}
                                type="radio"
                                value={index}
                                name="address"
                                onChange={() => setSelectedAddress(index)}
                                className="mt-1"
                              />

                              {/* Address Info */}
                              <div>
                                <p className="font-medium">
                                  {address.address_line ?? ""}
                                </p>
                                <p className="text-sm">{address.city ?? ""}</p>
                                <p className="text-sm">{address.state ?? ""}</p>
                                <p className="text-sm">
                                  {address.country ?? ""} -{" "}
                                  {address.pincode ?? ""}
                                </p>
                                <p className="text-sm">{address.mobile}</p>
                              </div>
                            </div>

                            {/* Edit + Delete Actions */}
                            <div className="flex flex-col items-center justify-center gap-3 mr-2">
                              <FaEdit
                                className="w-6 h-6 text-blue-600 cursor-pointer hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAddress(address);
                                  setOpenEditModal(true);
                                }}
                              />
                              <MdDelete
                                className="w-6 h-6 text-red-600 cursor-pointer hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteAddressId(address._id || "");
                                  setOpenDeleteModal(true);
                                }}
                              />
                            </div>
                          </div>
                        </label>
                      ) : null
                    )
                  )}
                </div>
              </section>
            </div>

            {/* Right Column (Span 1 for dedicated forms) */}
            <div className="lg:col-span-1 space-y-8">
              {/* REQUIRED: PASSWORD SECTION */}
              <section className="bg-white shadow-xl rounded-2xl p-6 space-y-3 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3">
                  Change Password
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passFormData.newPassword}
                    onChange={(e) =>
                      setPassFormData({
                        ...passFormData,
                        newPassword: e.target.value,
                      })
                    }
                    className="border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                    placeholder="Min 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passFormData.confirmPassword}
                    onChange={(e) =>
                      setPassFormData({
                        ...passFormData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 justify-between pt-2">
                  <button
                    onClick={handleUpdatePassword}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-5 py-2 rounded-lg font-medium shadow-md transition-colors text-sm"
                  >
                    Update Password
                  </button>
                  <button
                    onClick={() => console.log("Forget Password clicked")}
                    className="text-sm text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                  >
                    Forget Password?
                  </button>
                </div>
              </section>

              {/* REQUIRED: PHONE NUMBER SECTION */}
              <section className="bg-white shadow-xl rounded-2xl p-6 space-y-5 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-3">
                  Phone Number
                </h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all rounded-lg px-4 py-2.5 w-full text-sm shadow-sm"
                      placeholder="e.g., +1-555-123-4567"
                    />
                  </div>

                  <button
                    onClick={handleUpdatePhone}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2.5 rounded-lg font-medium shadow-md transition-colors text-sm whitespace-nowrap h-full"
                  >
                    Verify/Update
                  </button>
                </div>
              </section>
            </div>
          </div>

          <AddAddressDialog open={open} setOpen={setOpen} />

          <EditAddressDialog
            open={openEditModal}
            setOpen={setOpenEditModal}
            addressData={selectedAddress}
          />

          <ConfirmDeleteDialog
            open={openDeleteModal}
            onOpenChange={setOpenDeleteModal}
            onConfirm={handleDeleteAddress}
            onCancel={() => setDeleteAddressId(null)}
            title="Delete Address?"
            description="Are you sure you want to permanently delete this address?"
          />
        </main>
      </LayoutV1>
    </div>
  );
}
