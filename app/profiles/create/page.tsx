"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfile } from "@/app/services/profiles.service";
// import { createProfile } from "@/services/profiles.service";

export default function CreateProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await createProfile({ name });
      console.log("Created profile:", response);

      setCreatedProfile(response.data);
    } catch (err: any) {
      setError("Failed to create profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create Profile</h1>

      <input
        type="text"
        placeholder="Enter profile name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create"}
      </button>

      {createdProfile && (
        <div className="mt-6 p-4 border rounded-lg bg-green-50">
          <h2 className="font-medium mb-3">Profile Created</h2>

          <div className="space-y-1 text-sm text-zinc-700">
            <p>
              <strong>Name:</strong> {createdProfile.name}
            </p>
            <p className="capitalize">
              <strong>Gender:</strong> {createdProfile.gender}
            </p>
            <p>
              <strong>Gender Probability:</strong>{" "}
              {(createdProfile.gender_probability * 100).toFixed(1)}%
            </p>
            <p>
              <strong>Age:</strong> {createdProfile.age}
            </p>
            <p className="capitalize">
              <strong>Age Group:</strong> {createdProfile.age_group}
            </p>
            <p>
              <strong>Country:</strong> {createdProfile.country_name} (
              {createdProfile.country_id})
            </p>
            <p>
              <strong>Country Confidence:</strong>{" "}
              {(createdProfile.country_probability * 100).toFixed(1)}%
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(createdProfile.created_at).toLocaleString()}
            </p>
            <p>
              <strong>ID:</strong> {createdProfile.id}
            </p>
          </div>

          <button
            onClick={() => router.push(`/profiles/${createdProfile.id}`)}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            View Profile
          </button>
        </div>
      )}
    </main>
  );
}
