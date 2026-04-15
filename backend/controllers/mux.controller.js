import jwt from 'jsonwebtoken';
import { mux } from "../utils/mux.js";
import { envConfig } from '../config/env.js';

export async function MuxUploadUrl(req, res) {
    try {
        const upload = await mux.video.uploads.create({
            cors_origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            new_asset_settings: {
                playback_policy: ['signed'],
                video_quality: 'basic'
            }
        });
        
        return res.status(200).json({
            success: true,
            data: {
                url: upload.url,
                uploadId: upload.id
            }
        });
    } catch (error) {
        console.log("Error in Mux Upload Url: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export async function checkMuxUploadStatus(req, res) {
    try {
        const { uploadId } = req.params;
        
        if (!uploadId) {
            return res.status(400).json({
                success: false,
                error: "Upload ID is required"
            });
        }
        
        const upload = await mux.video.uploads.retrieve(uploadId);
        
        let response = {
            status: upload.status,
            assetId: upload.asset_id || null,
            playbackId: null,
            duration: null
        };
        
        if (upload.asset_id) {
            const asset = await mux.video.assets.retrieve(upload.asset_id);
            
            if (asset.playback_ids && asset.playback_ids.length > 0) {
                response.playbackId = asset.playback_ids[0].id;
            }
            response.assetId = asset.id;  
            response.duration = asset.duration;
            
            if (asset.status === 'ready') {
                response.status = 'asset_ready';
            } else if (asset.status === 'errored') {
                response.status = 'errored';
            }
        }
        
        return res.status(200).json({
            success: true,
            data: response
        });
        
    } catch (error) {
        console.log("Error in checkMuxUploadStatus: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

// Generate signed URL using JWT
export async function getSignedPlaybackUrl(req, res) {
    try {
        const { playbackId } = req.params;
        
        if (!playbackId) {
            return res.status(400).json({
                success: false,
                error: "Playback ID is required"
            });
        }

        // Get signing key from environment
        const signingKeyId = envConfig.MUX_SIGNING_KEY_ID;
        const signingKeyPrivate = envConfig.MUX_SIGNING_PRIVATE_KEY;

        // Debug logging
        console.log("🔍 Signing Key Debug Info:");
        console.log("  - Key ID present:", !!signingKeyId);
        console.log("  - Private Key present:", !!signingKeyPrivate);
        console.log("  - Private Key length:", signingKeyPrivate?.length || 0);

        if (!signingKeyId || !signingKeyPrivate) {
            console.error("❌ Missing signing credentials!");
            console.error("  - MUX_SIGNING_KEY_ID:", signingKeyId ? "✓ Present" : "✗ Missing");
            console.error("  - MUX_SIGNING_KEY_PRIVATE:", signingKeyPrivate ? "✓ Present" : "✗ Missing");
            
            return res.status(500).json({
                success: false,
                error: "Signing key not configured",
                missing: {
                    keyId: !signingKeyId,
                    privateKey: !signingKeyPrivate
                }
            });
        }
        let decodedKey;
        try {
            decodedKey = Buffer.from(signingKeyPrivate, 'base64').toString('utf-8');
            console.log("✓ Successfully decoded base64 private key");
        } catch (decodeError) {
            console.error("❌ Failed to decode base64 private key:", decodeError.message);
            return res.status(500).json({
                success: false,
                error: "Invalid private key encoding",
                details: "Private key must be base64 encoded"
            });
        }

        // Validate that decoded key looks like a PEM key
        if (!decodedKey.includes('BEGIN') || !decodedKey.includes('PRIVATE KEY')) {
            console.error("❌ Decoded key doesn't look like a valid PEM private key");
            console.error("  First 100 chars:", decodedKey.substring(0, 100));
            return res.status(500).json({
                success: false,
                error: "Invalid private key format",
                details: "Key should be a PEM formatted RSA private key"
            });
        }

        // Create JWT claims
        const claims = {
            sub: playbackId,
            aud: 'v', // 'v' for video playback
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours in seconds
            kid: signingKeyId
        };

        console.log("📋 JWT Claims:", {
            sub: claims.sub,
            aud: claims.aud,
            exp: new Date(claims.exp * 1000).toISOString(),
            kid: claims.kid
        });

        // Sign the JWT
        let signedToken;
        try {
            signedToken = jwt.sign(claims, decodedKey, { algorithm: 'RS256' });
            console.log("✓ Successfully signed JWT token");
        } catch (signError) {
            console.error("❌ Failed to sign JWT:", signError.message);
            console.error("  Error code:", signError.code);
            return res.status(500).json({
                success: false,
                error: "Failed to sign token",
                details: signError.message
            });
        }

        // Build the signed URL
        const signedUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${signedToken}`;
        
        console.log("✓ Generated signed URL successfully");
        console.log("  URL Preview:", signedUrl.substring(0, 80) + "...");
        
        return res.status(200).json({
            success: true,
            data: {
                playbackId: playbackId,
                signedUrl: signedUrl,
                expiresAt: new Date(claims.exp * 1000).toISOString()
            }
        });
        
    } catch (error) {
        console.error("❌ Unexpected error in getSignedPlaybackUrl:", error);
        console.error("  Stack:", error.stack);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: error.message
        });
    }
}