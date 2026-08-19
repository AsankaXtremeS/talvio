// components/auth/EmployerRegisterForm.tsx

"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth.service"
import Popup from "@/components/admin/layout/Popup"
import { useUploadThing } from "@/lib/uploadthing"

const schema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    businessRegistration: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

function getStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthMeta = [
  { label: "",        color: "",              text: ""                },
  { label: "Weak",   color: "bg-red-400",    text: "text-red-400"    },
  { label: "Fair",   color: "bg-orange-400", text: "text-orange-400" },
  { label: "Good",   color: "bg-yellow-400", text: "text-yellow-500" },
  { label: "Strong", color: "bg-green-500",  text: "text-green-500"  },
]

const inputClass =
  "w-full px-4 py-2.5 text-sm text-slate-900 placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

export default function EmployerSignupForm() {
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwValue, setPwValue] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [popup, setPopup] = useState<{ open: boolean; message: string; success?: boolean }>({ open: false, message: "", success: false })
  const fileRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading: isFileUploading } = useUploadThing("pdfUploader", {
    onUploadProgress: (p) => setUploadProgress(p),
    onUploadError: (e) => {
      setPopup({ open: true, message: `Upload failed: ${e.message}`, success: false })
    }
  })

  const toPopupMessage = (message: string) =>
    /already exists|already exist/i.test(message)
      ? "This user is already exist."
      : message

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const file = fileRef.current?.files?.[0]
      if (!file) {
        setPopup({ open: true, message: "Please upload your business registration PDF.", success: false })
        setIsLoading(false)
        return
      }

      // Step 1: Upload to UploadThing
      const uploadRes = await startUpload([file])
      if (!uploadRes || uploadRes.length === 0) {
        // Error already handled by onUploadError
        setIsLoading(false)
        return
      }

      const { url, name } = uploadRes[0]

      // Step 2: Register with backend
      const result = await authService.registerEmployer({
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        registrationFileUrl: url,
        registrationFileName: name,
      })

      if (result?.userId) {
        setPopup({ open: true, message: "Registration submitted! Awaiting admin approval.", success: true })
      } else {
        setPopup({ open: true, message: toPopupMessage(result?.message || "Registration failed. Please check your details and try again."), success: false })
      }
    } catch (error: unknown) {
      console.error("Error:", error)
      const message = error instanceof Error ? error.message : "An error occurred. Please try again."
      setPopup({ open: true, message: toPopupMessage(message), success: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
    else setFileName("")
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFileName(files[0].name)
      if (fileRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(files[0])
        fileRef.current.files = dataTransfer.files
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const strength = getStrength(pwValue)
  const { label, color, text } = strengthMeta[strength]

  return (
    <>
      <Popup
        open={popup.open}
        message={popup.message}
        success={popup.success}
        onClose={() => {
          setPopup({ ...popup, open: false })
          if (popup.success) {
            window.location.href = "/login/employer"
          }
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">

      {/* Company Name */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700">Company name</label>
        <input
          {...register("companyName")}
          placeholder="99x Technology"
          className={inputClass}
        />
        {errors.companyName && (
          <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@email.com"
          className={inputClass}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <input
            {...register("password", { onChange: (e) => setPwValue(e.target.value) })}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
        {/* Strength meter */}
        {pwValue && (
          <div className="mt-1.5 px-1">
            <div className="flex gap-1 mb-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? color : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${text}`}>{label}</p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-700">Confirm password</label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Business Registration Info */}
      <div>
        <label className="block mb-1 text-sm font-medium text-slate-700">
          Business registration info
        </label>
        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            id="fileUpload"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-white overflow-hidden relative ${
              isDragActive ? "bg-blue-50 border-blue-600" : "border-blue-400"
            }`}
          >
            {/* Progress Bar Overlay */}
            {(isFileUploading || isLoading) && uploadProgress > 0 && uploadProgress < 100 && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300 z-20" 
                style={{ width: `${uploadProgress}%` }}
              />
            )}

            <Upload className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-sm text-blue-600 px-4 text-center">
              {isFileUploading ? (
                <span className="flex flex-col items-center">
                  <span>Uploading {uploadProgress}%</span>
                </span>
              ) : fileName ? (
                <>
                  <span className="truncate max-w-[200px] inline-block align-bottom">{fileName}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setFileName("")
                      if (fileRef.current) fileRef.current.value = ""
                    }}
                    className="ml-2 px-2 py-0.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>Drag <span className="underline">here</span> or <span className="underline">browse</span></>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end pt-2">
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
          Forgot password?
        </Link>
      </div>

      {/* Get Started Button */}
      <button
        type="submit"
        disabled={isLoading || isFileUploading}
        className="w-full py-3 text-base font-semibold text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(90deg, #5F33E2 0%, #4F46E5 50%, #2563EB 100%)" }}
      >
        {isFileUploading ? "Uploading BR..." : isLoading ? "Creating account..." : "Get started"}
      </button>

    </form>
    </>
  )
}