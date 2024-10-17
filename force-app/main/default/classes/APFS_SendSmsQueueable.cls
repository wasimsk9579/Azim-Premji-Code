public class APFS_SendSmsQueueable implements Queueable {
    private Map<String, List<Map<String, String>>> smsRequests;

    public APFS_SendSmsQueueable(Map<String, List<Map<String, String>>> smsRequests) {
        this.smsRequests = smsRequests;
    }

    public void execute(QueueableContext context) {
        for (String mobile : smsRequests.keySet()) {
            for (Map<String, String> vars : smsRequests.get(mobile)) {
                APFS_Msg91UtilityQueueable smsJob = new APFS_Msg91UtilityQueueable(mobile, 'Change_Application_Status', vars);
                System.enqueueJob(smsJob);
            }
        }
    }
}