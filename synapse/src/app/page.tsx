"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainAnimation } from "@/components/brain-animation";
import { MemoryBubbles } from "@/components/memory-bubbles";
import { ParticleBackground } from "@/components/particle-background";
import { useAccount } from "wagmi";
import { getProfile, createProfile } from "@/contracts/function";

export default function Home() {
  const { address, isConnected } = useAccount();
  interface Profile {
    username: string;
    email: string;
    exists: boolean;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isConnected && address) {
        try {
          const userProfile = await getProfile(address);
          const typedProfile = userProfile as Profile;
          setProfile(typedProfile);
          setShowForm(!typedProfile.exists);
        } catch (error) {
          setShowForm(true);
        }
      }
    };
    fetchProfile();
  }, [isConnected, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const transaction = await createProfile(
        formData.username,
        formData.email
      );

      if (address) {
        const userProfile = await getProfile(address);
        const typedProfile = userProfile as Profile;
        setProfile(typedProfile);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          {profile && !showForm ? (
            <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-blue-100 max-w-md w-full mx-4 transform transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-blue-900">
                    {profile.username}
                  </h3>
                  <p className="text-blue-600">{profile.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md w-full mx-4 transform transition-all">
              <h3 className="text-2xl font-medium text-blue-900 mb-6">
                Complete Your Profile
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-blue-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Profile..." : "Create Profile"}
                </button>

                {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
              </form>
            </div>
          )}
        </div>
      )}

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 min-h-[80vh] flex items-center">
          <ParticleBackground />
          <div className="container relative z-10 px-4 py-24 mx-auto text-center md:px-6 md:py-32">
            <h1 className="text-4xl font-bold tracking-tight text-blue-900 md:text-6xl">
              Your Personal Memory Vault
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-lg text-blue-700">
              Synapse helps you store, organize, and recall your most precious
              memories with the power of AI.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 mt-10 md:flex-row">
              <button className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Start For Free
              </button>
              <button className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-600 transition-all duration-200 rounded-lg border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Learn More
              </button>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <BrainAnimation />
              <MemoryBubbles />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 bg-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full opacity-30 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full opacity-30 -ml-40 -mb-40"></div>

          <div className="container px-4 mx-auto md:px-6 relative z-10">
            <h2 className="text-3xl font-bold text-center text-blue-900">
              Why Choose Synapse
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-center text-blue-700">
              Our memory vault is designed to help you preserve what matters
              most.
            </p>
            <div className="grid gap-8 mt-12 md:grid-cols-3">
              <div className="p-6 text-center bg-blue-50 rounded-xl transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-medium text-blue-900">
                  Secure Storage
                </h3>
                <p className="mt-2 text-blue-700">
                  Your memories are encrypted and stored securely, accessible
                  only to you.
                </p>
              </div>
              <div className="p-6 text-center bg-blue-50 rounded-xl transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-medium text-blue-900">
                  AI-Powered Organization
                </h3>
                <p className="mt-2 text-blue-700">
                  Our neural network helps categorize and connect your memories
                  in meaningful ways.
                </p>
              </div>
              <div className="p-6 text-center bg-blue-50 rounded-xl transform transition-transform hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-medium text-blue-900">
                  Intuitive Recall
                </h3>
                <p className="mt-2 text-blue-700">
                  Find any memory instantly with our powerful search and
                  association tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-20 bg-blue-50 relative overflow-hidden"
        >
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>

          <div className="container px-4 mx-auto md:px-6 relative z-10">
            <h2 className="text-3xl font-bold text-center text-blue-900">
              How Synapse Works
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-center text-blue-700">
              Our neural network creates connections between your memories, just
              like your brain does.
            </p>
            <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative p-6 bg-white rounded-xl transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full -top-4 -left-4">
                  1
                </div>
                <h3 className="text-xl font-medium text-blue-900">Capture</h3>
                <p className="mt-2 text-blue-700">
                  Upload photos, videos, notes, or voice recordings to preserve
                  your memories.
                </p>
              </div>
              <div className="relative p-6 bg-white rounded-xl transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full -top-4 -left-4">
                  2
                </div>
                <h3 className="text-xl font-medium text-blue-900">Process</h3>
                <p className="mt-2 text-blue-700">
                  Our AI analyzes your memories, identifying people, places,
                  emotions, and themes.
                </p>
              </div>
              <div className="relative p-6 bg-white rounded-xl transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full -top-4 -left-4">
                  3
                </div>
                <h3 className="text-xl font-medium text-blue-900">Connect</h3>
                <p className="mt-2 text-blue-700">
                  Synapse creates neural connections between related memories,
                  building your personal network.
                </p>
              </div>
              <div className="relative p-6 bg-white rounded-xl transform transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-full -top-4 -left-4">
                  4
                </div>
                <h3 className="text-xl font-medium text-blue-900">Recall</h3>
                <p className="mt-2 text-blue-700">
                  Easily find and relive your memories through intuitive search
                  or guided journeys.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-50 rounded-full opacity-30 blur-2xl"></div>

          <div className="container px-4 mx-auto text-center md:px-6 relative z-10">
            <h2 className="text-3xl font-bold text-blue-900">
              Ready to Preserve Your Memories?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-blue-700">
              Join thousands of people who trust Synapse with their most
              precious memories.
            </p>
            <button className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Get Started For Free
            </button>
            <p className="mt-4 text-sm text-blue-600">
              No credit card required
            </p>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-blue-50 border-t border-blue-100">
        <div className="container px-4 mx-auto md:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Synapse
              </Link>
              <p className="text-sm text-blue-700">
                Your personal memory vault
              </p>
            </div>
            <div className="text-sm text-blue-700">
              © {new Date().getFullYear()} Synapse. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
