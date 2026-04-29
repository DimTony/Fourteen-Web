"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getProfile } from "@/app/services/profiles.service";
import { ChevronLeft } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  sample_size: number;
  country_name: string;
  country_id: string;
  country_probability: number;
  created_at: string;
};

const navItems = [
  { label: "Profiles", path: "/profiles" },
  { label: "Search", path: "/search" },
  { label: "Account", path: "/account" },
];

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getProfile(id);

        console.log("Fetched profile:", response);

        setProfile(response.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-zinc-500">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
        <div className="mt-4">
          <button
            onClick={() => router.back()}
            className="text-sm underline text-zinc-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getConfidenceColor = (value: number) => {
    if (value >= 0.7) return "text-green-600 bg-green-50 border-green-200";
    if (value >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 mb-8">

          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-zinc-50 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-semibold leading-tight">Account</h1>
            <p className="text-zinc-600 text-sm">
              Manage your account preferences and settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="text-sm text-zinc-600 hover:text-black transition"
              >
                {item.label}
              </button>
            ))}
          </nav>


        </div>
      </div>
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-zinc-500">ID: {profile.id}</p>
          </div>

          <span className="px-3 py-1 text-xs rounded-full bg-zinc-100 text-zinc-600">
            {profile.age_group}
          </span>
        </div>

        
        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-zinc-500">Age</p>
              <p className="text-lg font-semibold">{profile.age}</p>
            </div>

            <div className="p-4 rounded-lg border">
              <p className="text-xs text-zinc-500">Gender</p>

              <p className="text-lg font-semibold capitalize">
                {profile.gender}
              </p>

              <div
                className={`mt-2 inline-flex items-center px-2 py-1 rounded-md border text-sm ${getConfidenceColor(profile.gender_probability)}`}
              >
                {(profile.gender_probability * 100).toFixed(1)}% confidence
              </div>
            </div>

            
            <div className="p-4 rounded-lg border md:col-span-2">
              <p className="text-xs text-zinc-500">Country</p>

              <p className="text-lg font-semibold">{profile.country_name}</p>

              <p className="text-sm text-zinc-500">{profile.country_id}</p>

              <div
                className={`mt-2 inline-flex items-center px-2 py-1 rounded-md border text-sm ${getConfidenceColor(profile.country_probability)}`}
              >
                {(profile.country_probability * 100).toFixed(1)}% confidence
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <p className="text-xs text-zinc-500">Sample Size</p>
              <p className="text-lg font-semibold">{profile.sample_size}</p>
            </div>

            <div className="p-4 rounded-lg border">
              <p className="text-xs text-zinc-500">Created At</p>
              <p className="text-sm font-medium">
                {new Date(profile.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-zinc-50 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
