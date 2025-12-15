/**
 * Cloud Functions for EnPuerta
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

/**
 * Finalize Expired Events
 *
 * Callable function that updates all active events with past dates
 * to 'finished' status. Only callable by super admin users.
 */
export const finalizeExpiredEvents = onCall(async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "User must be authenticated to call this function"
        );
    }

    const userId = request.auth.uid;
    logger.info(`finalizeExpiredEvents called by user: ${userId}`);

    try {
        // Get current date/time
        const now = new Date();

        // Query all active events
        const eventsSnapshot = await admin.firestore()
            .collection("events")
            .where("status", "==", "active")
            .get();

        if (eventsSnapshot.empty) {
            logger.info("No active events found");
            return {
                success: true,
                count: 0,
                message: "No hay eventos activos para finalizar",
            };
        }

        // Filter events with past dates and prepare batch update
        const batch = admin.firestore().batch();
        let expiredCount = 0;

        eventsSnapshot.forEach((doc) => {
            const eventData = doc.data();

            // Check if event has a date field and if it's in the past
            if (eventData.date) {
                let eventDate: Date;

                // Handle Firestore Timestamp
                if (eventData.date.toDate) {
                    eventDate = eventData.date.toDate();
                } else {
                    eventDate = new Date(eventData.date);
                }

                // If event date has passed, mark for update
                if (eventDate < now) {
                    batch.update(doc.ref, {
                        status: "finished",
                        finalizedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    expiredCount++;
                    logger.info(
                        `Marking event ${doc.id} as finished (date: ${eventDate})`
                    );
                }
            }
        });

        // Commit batch update
        if (expiredCount > 0) {
            await batch.commit();
            logger.info(
                `Successfully finalized ${expiredCount} expired events`
            );
        }

        return {
            success: true,
            count: expiredCount,
            message: `${expiredCount} evento(s) finalizado(s) correctamente`,
        };
    } catch (error) {
        logger.error("Error finalizing expired events:", error);
        throw new HttpsError(
            "internal",
            "Error al finalizar eventos: " + (error as Error).message
        );
    }
});
