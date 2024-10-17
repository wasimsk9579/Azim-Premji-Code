public class APFS_AppStatusSubmittedToReviewSchedule implements Schedulable {
    public void execute(SchedulableContext sc) {
        try {
            // Execute the batch class with a batch size of 40
          APFS_AppStatusSubmittedToReview appbatchclasss = new APFS_AppStatusSubmittedToReview();
          Database.executeBatch(appbatchclasss, 40);} catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_AppStatusSubmittedToReviewSchedule', 'execute', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException(e.getMessage());
        }
    }
}