public without sharing class APFS_CustomLoginController {

    @AuraEnabled
    public static string loginToPortal(String username, String password, String startUrl){
        try {
            
            ApexPages.PageReference pageRef = Site.login(username, password, startUrl);
 			if(pageRef != null) {
                return pageRef.getUrl();
            }
            throw new APFS_CustomException('Failed to authenticate. Please try again.');
          
        } catch (Exception e) {
            throw new APFS_CustomException(e.getMessage());
        }
       
  }
}