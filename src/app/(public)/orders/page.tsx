"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LayoutV2 from "../layout/layoutV2";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { RootState } from "@/redux/store/store";
import { IoCall } from "react-icons/io5";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteAddress, getAllAddress } from "@/services/operations/address";
import { useDispatch, useSelector } from "react-redux";
import CTASection from "@/components/common/ctaButton/ctaSection";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import AddAddressDialog from "@/components/common/address/AddAddressDialog";
import EditAddressDialog from "@/components/common/address/EditAddressDialog";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { TbFileInvoice, TbTruckDelivery } from "react-icons/tb";
import { FaTruckArrowRight } from "react-icons/fa6";
import ConfirmDeleteDialog from "@/components/common/Dialogs/ConfirmDialog";
import { useRouter } from "next/navigation";
import { getAllOrders, placeCODOrder } from "@/services/operations/orders";

export default function OrderPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const addressList = useSelector(
    (state: RootState) => state.address.addresses
  );

  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>("");
  const [openCODModal, setOpenCODModal] = useState(false);

  const { items, totalPrice, totalQuantity, totalOriginalPrice } = useSelector(
    (state: RootState) => state.cart
  );

  const [openEditModal, setOpenEditModal] = useState(false);

  const fetchCartItem = async () => {
    try {
      const mappedCartData = await getAllCartItems();
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

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

  // const downloadInvoice = () => {
  //   const blob = new Blob(["Invoice coming soon..."], { type: "text/plain" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "invoice.txt";
  //   link.click();
  // };

  const handleCashOnDelivery = async () => {
    // 1. Validation Checks
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    const addressId =
      addressList && addressList[selectedAddress]
        ? (addressList[selectedAddress]._id as string)
        : null;

    if (!addressId) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      const data = {
        list_items: items,
        addressId: addressId,
        subTotalAmt: totalOriginalPrice,
        totalAmt: totalPrice,
      };

      // 2. Call the Service
      const response = await placeCODOrder(data, token, dispatch);

      // 3. Check if successful
      if (response) {
        toast.success("Order placed successfully (COD)");
        router.push("/orders/success");
      }
    } catch (error) {
      console.error("Handle COD Error:", error);
      toast.error("Failed to place order");
    }
  };

  const fetchOrder = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    try {
      const mappedOrders = await getAllOrders(token, dispatch);
      // console.log("mappedOrders: ", mappedOrders);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load orders data");
    }
  };

  useEffect(() => {
    fetchCartItem();
    fetchAddress();
    fetchOrder();
  }, []);

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        <main className="w-11/12 flex flex-col gap-8 max-h">
          <div className="w-full mx-auto mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-8 px-2 pt-8 md:p-6 bg-(--mainBg)">
            {/* LEFT SECTION */}
            <div className="space-y-6">
              {/* Choose Address */}
              <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">
                  Choose your address
                </h2>

                {addressList.map((address, index: number) =>
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
                              {address.address_line}
                            </p>
                            <p className="text-sm">{address.city}</p>
                            <p className="text-sm">{address.state}</p>
                            <p className="text-sm">
                              {address.country} - {address.pincode}
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
                )}

                {/* Add Address Box */}
                <div
                  className="mt-4 border border-gray-400 border-dashed p-4 text-center rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setOpen(true)}
                >
                  Add address
                </div>
              </div>
            </div>

            {/* RIGHT — SUMMARY BOX */}
            <div className="bg-white rounded-xl p-5 shadow h-fit space-y-4">
              <h2 className="font-semibold text-lg"> 📝 Bill Summary</h2>

              {/* Bill Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p>Items Total</p>
                  <p className="flex items-center gap-2">
                    <span className="line-through text-neutral-400">
                      {DisplayPriceInRupees(totalOriginalPrice)}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </p>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span>{totalQuantity} items</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges will be added</span>
                  <span className="text-green-600"></span>
                </div>

                <hr className="border border-dashed border-gray-700" />

                <div className="flex justify-between font-semibold text-lg">
                  <span> Grand Total</span>
                  <p className="text-2xl font-bold text-blue-700">
                    {DisplayPriceInRupees(totalPrice)}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <Button className="w-full p-5 bg-green-600 hover:bg-green-900 cursor-pointer">
                <Link href="tel:+917440287174">Call Now</Link>
                <IoCall style={{ width: 20, height: 20 }} />
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCODModal(true);
                }}
                variant="outline"
                className="w-full p-5 cursor-pointer"
              >
                Cash on Delivery
                <FaTruckArrowRight style={{ width: 20, height: 20 }} />
              </Button>

              {/* <Button
                onClick={() => downloadInvoice}
                className="w-full p-5 bg-blue-600 hover:bg-blue-900 cursor-pointer"
              >
                Download Invoice
                <TbFileInvoice style={{ width: 20, height: 20 }} />
              </Button> */}
            </div>

            {/* ADD ADDRESS MODAL */}
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

            <ConfirmDeleteDialog
              open={openCODModal}
              onOpenChange={setOpenCODModal}
              onConfirm={handleCashOnDelivery}
              onCancel={() => setOpenCODModal(false)}
              title="Confirm Cash On Delivery 📦"
              description="Are you sure you want to place this order using Cash on Delivery?"
            />
          </div>

          <CTASection />
        </main>
      </LayoutV2>
    </div>
  );
}
