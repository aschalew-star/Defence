import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { loadUser } from "../../redux/Action/user";
import { toast } from "react-toastify";
import {
  CgProfile,
} from "react-icons/cg";
import {
  BsBagCheck,
  BsGeoAlt,
  BsShieldLock,
  BsCamera,
  BsTrash,
  BsPlusLg,
  BsCheck2,
} from "react-icons/bs";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";

function Profile() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(1); // 1: Profile info, 2: Addresses, 3: Security

  // Personal Info Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updatingInfo, setUpdatingInfo] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Address Form Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [country, setCountry] = useState("Ethiopia");
  const [city, setCity] = useState("Addis Ababa");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("1000");
  const [addressType, setAddressType] = useState("Home");
  const [submittingAddress, setSubmittingAddress] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  // Update Avatar Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        try {
          const res = await axios.put(
            `${server}/user/update-avatar`,
            { avatar: reader.result },
            { withCredentials: true }
          );
          if (res.data?.success) {
            toast.success("Profile avatar updated!");
            dispatch(loadUser());
          }
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to update avatar");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Update Personal Info Handler
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setUpdatingInfo(true);
    try {
      const res = await axios.put(
        `${server}/user/update-user-info`,
        { name, email, phoneNumber },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Account profile updated successfully!");
        dispatch(loadUser());
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingInfo(false);
    }
  };

  // Update Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters!");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await axios.put(
        `${server}/user/update-user-password`,
        { oldPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Add Address Handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!address1.trim() || !city.trim()) {
      toast.error("Please fill in address and city!");
      return;
    }

    setSubmittingAddress(true);
    try {
      const res = await axios.put(
        `${server}/user/update-user-addresses`,
        {
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Delivery address added!");
        dispatch(loadUser());
        setAddressModalOpen(false);
        setAddress1("");
        setAddress2("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await axios.delete(
        `${server}/user/delete-user-address/${addressId}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.info("Address removed");
        dispatch(loadUser());
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete address");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-bold font-serif text-gray-900">Please Sign In</h2>
        <p className="text-sm text-gray-500 mt-2">Sign in to view and manage your account details.</p>
        <Link to="/login">
          <button className="mt-6 px-8 py-3 bg-amber-800 text-white font-bold rounded-xl shadow-md">
            Go to Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* User Avatar & Name Card */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
            <div className="relative group mb-3">
              <img
                src={user.avatar?.url || "/placeholder-avatar.png"}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-100 shadow-md bg-amber-50"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-amber-800 hover:bg-amber-900 text-white rounded-full shadow-md cursor-pointer transition transform hover:scale-110"
                title="Change Photo"
              >
                <BsCamera className="text-sm" />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="text-lg font-bold text-gray-900 font-serif">{user.name}</h3>
            <p className="text-xs text-gray-400">{user.email}</p>
            {user.role && user.role !== "user" && (
              <span className="mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {user.role}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            {[
              { id: 1, label: "Personal Information", icon: CgProfile },
              { id: 2, label: "Delivery Addresses", icon: BsGeoAlt },
              { id: 3, label: "Account Security & Password", icon: BsShieldLock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                    activeTab === tab.id
                      ? "bg-amber-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-amber-50/60 hover:text-amber-900"
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <Link
              to="/order"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-amber-50/60 hover:text-amber-900 transition"
            >
              <BsBagCheck className="text-base" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>

        {/* RIGHT CONTENT PANE (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
          
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 1 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-serif">Personal Information</h2>
                <p className="text-xs text-gray-500 mt-1">Manage your contact details and profile preferences</p>
              </div>

              <form onSubmit={handleUpdateInfo} className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Phone Number (Telebirr / Courier Contact)
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 9... or 09..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updatingInfo}
                    className="py-3 px-8 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs shadow-md transition disabled:bg-gray-300"
                  >
                    {updatingInfo ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: DELIVERY ADDRESSES */}
          {activeTab === 2 && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 font-serif">Delivery Addresses</h2>
                  <p className="text-xs text-gray-500 mt-1">Saved addresses for fast courier checkout</p>
                </div>

                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <BsPlusLg className="text-xs" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Address List */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-5 rounded-2xl bg-gray-50/60 border border-gray-100 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-md">
                            {addr.addressType || "Home"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{addr.address1}</p>
                        {addr.address2 && <p className="text-xs text-gray-500">{addr.address2}</p>}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {addr.city}, {addr.country} {addr.zipCode && `(${addr.zipCode})`}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Remove Address"
                      >
                        <BsTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <BsGeoAlt className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No delivery addresses saved yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add your residence or office address in Addis Ababa or regional cities.
                  </p>
                </div>
              )}

              {/* Add Address Modal */}
              {addressModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 font-serif">Add New Address</h3>

                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Country</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">City / Region</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Addis Ababa, Hawassa, etc."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Street Address 1</label>
                        <input
                          type="text"
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          placeholder="e.g. Bole Subcity, Woreda 03, House 412"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Address 2 (Optional)</label>
                        <input
                          type="text"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="Apartment, Landmark, or Courier instructions"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Zip Code</label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Address Tag</label>
                          <select
                            value={addressType}
                            onChange={(e) => setAddressType(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setAddressModalOpen(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingAddress}
                          className="px-6 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow"
                        >
                          {submittingAddress ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SECURITY & PASSWORD */}
          {activeTab === 3 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-serif">Account Security</h2>
                <p className="text-xs text-gray-500 mt-1">Change your marketplace password</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="py-2.5 px-6 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs shadow-md transition disabled:bg-gray-300"
                  >
                    {updatingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

