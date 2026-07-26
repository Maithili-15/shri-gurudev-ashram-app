import { Router } from "express";
import { HttpError } from "../errors";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { supabaseAdmin } from "../services/supabaseAdmin";
import { createNotification } from "../services/notifications";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", (request as AuthenticatedRequest).userId)
      .single();
    if (error || !data) throw new HttpError(404, "User profile not found");
    response.json({ user: data });
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", requireAuth, async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const updates: Record<string, unknown> = {};
    if (typeof body.fullName === "string")
      updates.full_name = body.fullName.trim();
    if (typeof body.phone === "string" || typeof body.phoneNumber === "string")
      updates.phone_number = (body.phone || body.phoneNumber).trim();
    if (typeof body.whatsappNumber === "string")
      updates.whatsapp_number = body.whatsappNumber.trim();
    if (typeof body.email === "string")
      updates.email = body.email.trim();
    if (typeof body.dob === "string")
      updates.dob = body.dob.trim();
    if (typeof body.gender === "string")
      updates.gender = body.gender.trim();
    if (typeof body.address === "string")
      updates.address = body.address.trim();
    if (typeof body.emergencyContactName === "string")
      updates.emergency_contact_name = body.emergencyContactName.trim();
    if (typeof body.emergencyContactPhone === "string")
      updates.emergency_contact_phone = body.emergencyContactPhone.trim();
    if (typeof body.emergencyContactRelation === "string")
      updates.emergency_contact_relation = body.emergencyContactRelation.trim();
    if ("profileImageUrl" in body && (body.profileImageUrl === null || typeof body.profileImageUrl === "string"))
      updates.profile_image_url = body.profileImageUrl;
    if (typeof body.pushToken === "string")
      updates.push_token = body.pushToken;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", (request as AuthenticatedRequest).userId)
      .select("*")
      .single();

    if (error || !data)
      throw new HttpError(400, error?.message ?? "Could not update profile");
    response.json({ user: data });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", requireAuth, async (request, response, next) => {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", (request as AuthenticatedRequest).userId);

    if (error) throw new HttpError(400, error.message);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

type SubmitVerificationBody = {
  identityType?: "aadhaar" | "pan";
  aadhaarNumber?: string;
  aadhaarImagePath?: string | null;
  aadhaarBackImagePath?: string | null;
  selfieImagePath?: string | null;
  panNumber?: string;
  panImagePath?: string | null;
};

// Upload Aadhaar Front image
usersRouter.post(
  "/upload-aadhaar",
  requireAuth,
  upload.single("aadhaarImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload Aadhaar Back image
usersRouter.post(
  "/upload-aadhaar-back",
  requireAuth,
  upload.single("aadhaarBackImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload PAN image
usersRouter.post(
  "/upload-pan",
  requireAuth,
  upload.single("panImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

// Upload selfie image
usersRouter.post(
  "/upload-selfie",
  requireAuth,
  upload.single("selfieImage"),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & {
        file?: Express.Multer.File;
      };

      if (!authRequest.file) {
        throw new HttpError(400, "No image file provided");
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`;

      response.status(200).json({ path: relativePath });
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  "/upload-profile-image",
  requireAuth,
  upload.single("profileImage"),
  async (request, response, next) => {
    const fs = require('fs');
    const authRequest = request as AuthenticatedRequest & {
      file?: Express.Multer.File;
    };

    if (!authRequest.file) {
      next(new HttpError(400, "No image file provided"));
      return;
    }

    const filePath = authRequest.file.path;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = authRequest.file.originalname.split('.').pop() || 'jpg';
      const path = `${authRequest.userId}/${Date.now()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(path, fileBuffer, {
          contentType: authRequest.file.mimetype,
          upsert: true,
        });

      if (error) {
        const isBucketMissing = error.message?.toLowerCase().includes('not found') || (error as any).status === 404;
        throw new HttpError(
          500,
          isBucketMissing
            ? "Storage bucket 'profile-images' is missing or unconfigured."
            : error.message
        );
      }

      const { data } = supabaseAdmin.storage
        .from('profile-images')
        .getPublicUrl(path);

      response.status(200).json({ publicUrl: data.publicUrl });
    } catch (error) {
      next(error);
    } finally {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }
  }
);

usersRouter.post(
  "/verification/submit",
  requireAuth,
  async (request, response, next) => {
    try {
      const {
        identityType = "aadhaar",
        aadhaarNumber,
        aadhaarImagePath,
        aadhaarBackImagePath,
        selfieImagePath,
        panNumber,
        panImagePath,
      } = request.body as SubmitVerificationBody;

      const authRequest = request as AuthenticatedRequest;

      // Check existing status
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("verification_status")
        .eq("id", authRequest.userId)
        .maybeSingle();

      if (fetchError) {
        throw new HttpError(500, "Failed to load user profile");
      }

      if (!existingUser) {
        throw new HttpError(404, "User profile not found");
      }

      if (
        existingUser.verification_status === "submitted" ||
        existingUser.verification_status === "verified"
      ) {
        throw new HttpError(409, "Verification has already been submitted");
      }

      const updatePayload: Record<string, any> = {
        identity_type: identityType,
        verification_status: "submitted",
      };

      if (identityType === "pan") {
        if (!panNumber || typeof panNumber !== "string" || !/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber.trim().toUpperCase())) {
          throw new HttpError(400, "Valid PAN number is required (format: ABCDE1234F)");
        }
        if (!panImagePath || typeof panImagePath !== "string" || !panImagePath.trim()) {
          throw new HttpError(400, "panImagePath is required");
        }

        const cleanPan = panNumber.trim().toUpperCase();
        updatePayload.pan_number = cleanPan;
        updatePayload.pan_image_path = panImagePath.trim();
        updatePayload.identity_number_masked = `XXXXX${cleanPan.slice(-4)}`;
      } else {
        // Aadhaar
        if (!aadhaarNumber || typeof aadhaarNumber !== "string" || !/^\d{12}$/.test(aadhaarNumber.trim())) {
          throw new HttpError(400, "aadhaarNumber must be exactly 12 numeric digits");
        }
        if (!aadhaarImagePath || typeof aadhaarImagePath !== "string" || !aadhaarImagePath.trim()) {
          throw new HttpError(400, "aadhaarImagePath is required");
        }
        if (!selfieImagePath || typeof selfieImagePath !== "string" || !selfieImagePath.trim()) {
          throw new HttpError(400, "selfieImagePath is required");
        }

        const cleanAadhaar = aadhaarNumber.trim();
        updatePayload.aadhaar_number = cleanAadhaar;
        updatePayload.aadhaar_image_path = aadhaarImagePath.trim();
        if (aadhaarBackImagePath) updatePayload.aadhaar_back_image_path = aadhaarBackImagePath.trim();
        updatePayload.selfie_image_path = selfieImagePath.trim();
        updatePayload.identity_number_masked = `XXXX XXXX ${cleanAadhaar.slice(-4)}`;
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update(updatePayload)
        .eq("id", authRequest.userId)
        .select("*")
        .single();

      if (updateError || !updatedUser) {
        throw new HttpError(
          500,
          updateError?.message ?? "Failed to submit verification",
        );
      }

      response.status(200).json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  },
);

// ─── Website Admin Verification Management ──────────────────────────────────
usersRouter.get("/admin/verifications", requireAuth, async (request, response, next) => {
  try {
    const status = request.query.status as string | undefined;
    let query = supabaseAdmin
      .from("users")
      .select("id, full_name, phone_number, email, verification_status, identity_type, identity_number_masked, aadhaar_image_path, aadhaar_back_image_path, pan_image_path, selfie_image_path, review_notes, reviewed_by, reviewed_at, created_at")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("verification_status", status);
    } else {
      query = query.in("verification_status", ["submitted", "verified", "rejected"]);
    }

    const { data, error } = await query;
    if (error) throw new HttpError(500, error.message);
    response.json({ verifications: data ?? [] });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/admin/verifications/:targetUserId/review", requireAuth, async (request, response, next) => {
  try {
    const { targetUserId } = request.params;
    const { action, notes } = request.body ?? {};

    if (!action || !["approve", "reject"].includes(action)) {
      throw new HttpError(400, "Action must be 'approve' or 'reject'");
    }

    const reviewerId = (request as AuthenticatedRequest).userId;
    const newStatus = action === "approve" ? "verified" : "rejected";

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update({
        verification_status: newStatus,
        review_notes: notes ? String(notes).trim() : null,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", targetUserId)
      .select("*")
      .single();

    if (error || !updatedUser) {
      throw new HttpError(500, error?.message ?? "Failed to update verification review");
    }

    const userIdStr = String(targetUserId);

    if (newStatus === "verified") {
      await createNotification(userIdStr, "Verification Approved", "Your identity verification has been approved by the Ashram administration.");
    } else {
      await createNotification(userIdStr, "Verification Update", `Your identity verification status was updated to ${newStatus}.${notes ? ` Notes: ${notes}` : ""}`);
    }

    response.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});
