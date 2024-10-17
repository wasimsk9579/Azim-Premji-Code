public class DisbursementTriggerHandler {
    // Static variable to prevent recursion
    public static Boolean isTriggerActive = true;

    /**
     * @description Processes after insert and update operations on Disbursement records.
     * Collects the Offer IDs from the new Disbursement records and updates related fields.
     * 
     * @param newDisbursements List of new Disbursement__c records being inserted or updated.
     */
    public static void handleAfterInsertUpdate(List<Disbursement__c> newDisbursements) {
        // Check if the trigger is already running
        if (!isTriggerActive) return;
        
        isTriggerActive = false; // Disable the trigger for this transaction

        Set<Id> offerIds = new Set<Id>();
        Set<Id> applicationIds = new Set<Id>();


        // Collect Offer IDs from new disbursement records
        for (Disbursement__c disbursement : newDisbursements) {
            if (disbursement.Offer__c != null && disbursement.Application__c !=null) {
                offerIds.add(disbursement.Offer__c);
                applicationIds.add(disbursement.Application__c);
            }
        }

        // If there are Offer IDs, update the related Disbursement records
        system.debug('Application Id'+applicationIds);
		system.debug('Offer Id'+offerIds);

        if (!offerIds.isEmpty()) {
            updateDisbursementWithOfferData(offerIds);
        }

        isTriggerActive = true; // Re-enable the trigger after processing
    }

    /**
     * @description Processes after delete and update operations on Disbursement records.
     * Collects the Offer IDs from the old Disbursement records and updates related fields.
     * 
     * @param oldDisbursements List of old Disbursement__c records being deleted or updated.
     */
    public static void handleAfterDelete(List<Disbursement__c> oldDisbursements) {
        // Check if the trigger is already running
        if (!isTriggerActive) return;

        isTriggerActive = false; // Disable the trigger for this transaction

        Set<Id> offerIds = new Set<Id>();

        // Collect Offer IDs from old disbursement records
        for (Disbursement__c disbursement : oldDisbursements) {
            if (disbursement.Offer__c != null) {
                offerIds.add(disbursement.Offer__c);
            }
        }

        // If there are Offer IDs, update the related Disbursement records
        if (!offerIds.isEmpty()) {
            updateDisbursementWithOfferData(offerIds);
        }

        isTriggerActive = true; // Re-enable the trigger after processing
    }

    /**
     * @description Updates Disbursement records by calculating Total Disbursed Amount and Balance Amount.
     * The Balance Amount is calculated as the difference between Total Scholarship Amount (from a formula field)
     * and the Total Disbursed Amount (summed across all related Disbursement records for the same Offer).
     * 
     * @param offerIds Set of Offer__c record IDs related to the Disbursement records.
     * 
     * @throws APFS_CustomException Custom exception to handle any errors during the update process.
     */
    private static void updateDisbursementWithOfferData(Set<Id> offerIds) {
        try {
            // Query total disbursement amounts (Transaction_Amount__c) grouped by Offer__c
            Map<Id, Decimal> totalDisbursementsMap = new Map<Id, Decimal>();
            List<AggregateResult> aggregatedResults = [
                SELECT Offer__c, SUM(Transaction_Amount__c) totalAmountPaid
                FROM Disbursement__c
                WHERE Offer__c IN :offerIds
                GROUP BY Offer__c
            ];

            // Populate totalDisbursementsMap with the sum of transaction amounts per Offer
            for (AggregateResult result : aggregatedResults) {
                totalDisbursementsMap.put((Id) result.get('Offer__c'), (Decimal) result.get('totalAmountPaid'));
            }

            // Query related Disbursement records to update Total Disbursed and Balance Amount
            List<Disbursement__c> disbursementsToUpdate = [
                SELECT Id, Offer__c, Total_Disbursed_Amount__c, Balance_Amount__c, Total_Scholarship_Amount__c
                FROM Disbursement__c
                WHERE Offer__c IN :offerIds
            ];

            // Iterate over each Disbursement record and update its fields
            for (Disbursement__c disbursement : disbursementsToUpdate) {
                // Get the total disbursed amount for the Offer
                Decimal totalDisbursed = totalDisbursementsMap.containsKey(disbursement.Offer__c) 
                    ? totalDisbursementsMap.get(disbursement.Offer__c) : 0;

                // Use Total_Scholarship_Amount__c (formula field) to calculate Balance
                Decimal totalScholarshipAmount = disbursement.Total_Scholarship_Amount__c;
                
                // Update Total Disbursed Amount and Balance Amount for the Disbursement record
                disbursement.Total_Disbursed_Amount__c = totalDisbursed;
                disbursement.Balance_Amount__c = totalScholarshipAmount - totalDisbursed;
            }

            // Update all modified Disbursement records
            if (!disbursementsToUpdate.isEmpty()) {
                update disbursementsToUpdate;
            }
        } catch (Exception e) {
            // Throw a custom exception in case of any errors
            throw new APFS_CustomException('Error updating Disbursement records: ' + e.getMessage());
        }
    }
}