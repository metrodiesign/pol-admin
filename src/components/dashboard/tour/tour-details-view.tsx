"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Share2,
  Heart,
  Star,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  ChevronDown,
} from "lucide-react";
import type { Tour } from "@/types/tour";
import { BOOKERS } from "@/lib/mock/tour";
import { TourGallery } from "./tour-gallery";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface TourDetailsViewProps {
  tour: Tour;
}

export function TourDetailsView({ tour }: TourDetailsViewProps) {
  const [favorited, setFavorited] = useState(false);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  return (
    <div className="w-full pt-2">
      {/* Action bar */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/dashboard/tour/list"
          className="inline-flex items-center gap-1 text-sm font-semibold text-grey-700 hover:text-grey-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/tour/edit?id=${tour.id}`}
            className="flex size-8 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
            aria-label="Edit tour"
          >
            <Pencil className="size-4" />
          </Link>
          {/* Status control — dark contained button */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1.5 rounded-control bg-foreground px-3 py-1.5 text-sm font-bold text-card transition-opacity hover:opacity-90 outline-none"
              aria-label="Change status"
            >
              {status}
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-32">
              {(["Draft", "Published"] as const).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatus(s)}
                  className={s === status ? "font-semibold" : ""}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content">
        <TabsList
          variant="line"
          className="mb-6 w-full border-b border-grey-200 rounded-none h-auto pb-0 justify-start gap-0"
        >
          <TabsTrigger
            value="content"
            className="mr-10 min-h-12 rounded-none border-0 bg-transparent px-0 pb-3 pt-3 text-sm font-semibold data-active:bg-transparent data-active:shadow-none"
          >
            Tour content
          </TabsTrigger>
          <TabsTrigger
            value="bookers"
            className="min-h-12 rounded-none border-0 bg-transparent px-0 pb-3 pt-3 text-sm font-semibold data-active:bg-transparent data-active:shadow-none flex items-center gap-1.5"
          >
            Booker
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-grey-200 px-1.5 text-xs font-semibold text-grey-700">
              {tour.bookedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tour content tab */}
        <TabsContent value="content">
          {/* Gallery */}
          <TourGallery images={tour.images} title={tour.title} />

          {/* Title + actions */}
          <div className="mt-6 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-grey-800">{tour.title}</h1>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 transition-colors"
                aria-label="Share tour"
              >
                <Share2 className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setFavorited((f) => !f)}
                className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                  favorited
                    ? "text-error bg-error/10 hover:bg-error/20"
                    : "text-grey-400 hover:bg-grey-100"
                }`}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={favorited}
              >
                <Heart className={`size-5 ${favorited ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Meta line */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-grey-600">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-semibold text-grey-800">{tour.rating}</span>
              <span className="text-grey-500">(234 reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="size-4 text-grey-500" />
              {tour.country}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-grey-400">Guide by</span>
              {tour.guides[0] && (
                <span className="flex items-center gap-1">
                  <span className="relative size-5 overflow-hidden rounded-full border border-grey-200">
                    <Image
                      src={tour.guides[0].avatarUrl}
                      alt={tour.guides[0].name}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  </span>
                  <span className="font-semibold text-grey-800">{tour.guides[0].name}</span>
                </span>
              )}
            </div>
          </div>

          <Separator className="my-5" />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-grey-500 mb-1">
                <Calendar className="size-4" />
                Available
              </div>
              <p className="text-sm font-semibold text-grey-800">
                {tour.startDate} - {tour.endDate}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-grey-500 mb-1">
                <User className="size-4" />
                Contact name
              </div>
              <p className="text-sm font-semibold text-grey-800">{tour.contactName}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-grey-500 mb-1">
                <Clock className="size-4" />
                Durations
              </div>
              <p className="text-sm font-semibold text-grey-800">{tour.duration}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-grey-500 mb-1">
                <Phone className="size-4" />
                Contact phone
              </div>
              <p className="text-sm font-semibold text-grey-800">{tour.contactPhone}</p>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Description */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-grey-800">Description</h2>
            <p className="text-base leading-7 text-grey-700">{tour.description}</p>
          </section>

          {/* Highlights */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-grey-800">Highlights</h2>
            <ul className="space-y-2">
              {tour.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-grey-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <Check className="size-3 text-success-dark" strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Program */}
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-grey-800">Program</h2>
            <div className="space-y-4">
              {tour.program.map((p, i) => (
                <div key={i}>
                  <p className="mb-1 font-bold text-grey-800">{p.heading}</p>
                  <p className="text-base leading-7 text-grey-700">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-grey-800">Services</h2>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
              {[
                "Audio guide",
                "Food and drinks",
                "Lunch",
                "Private tour",
                "Special activities",
                "Entrance fees",
                "Gratuities",
                "Pick-up and drop off",
                "Professional guide",
                "Transport by air-conditioned",
              ].map((service) => {
                const included = tour.services.includes(service);
                return (
                  <div key={service} className="flex items-center gap-2 text-sm">
                    <Check
                      className={`size-4 shrink-0 ${
                        included ? "text-success-dark" : "text-grey-300"
                      }`}
                      strokeWidth={3}
                    />
                    <span className={included ? "text-grey-800" : "text-grey-400"}>
                      {service}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </TabsContent>

        {/* Bookers tab */}
        <TabsContent value="bookers">
          <div className="space-y-3">
            {BOOKERS.map((booker) => (
              <div
                key={booker.id}
                className="flex items-center justify-between rounded-card border border-grey-100 bg-card p-4"
                style={{ boxShadow: "0 0 2px rgba(145,158,171,0.1)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full bg-grey-200">
                    <Image
                      src={booker.avatarUrl}
                      alt={booker.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-grey-800">{booker.name}</p>
                    <p className="text-xs text-grey-500">{booker.guests} guests</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    booker.approved
                      ? "bg-success/10 text-success-dark"
                      : "bg-warning/10 text-warning-dark"
                  }`}
                >
                  {booker.approved ? "Approved" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
