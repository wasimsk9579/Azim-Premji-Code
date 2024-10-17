public with sharing class VFPageController {
    @AuraEnabled
    public static Boolean saveVFPageToRecord(Id recordId) {
        try {
            // Render VF page as PDF
            PageReference pageRef = Page.APFS_ApplicationPreview;
            pageRef.getParameters().put('Id', recordId);

            // Get the page content as a PDF Blob
            Blob pdfBlob = pageRef.getContentAsPDF();

            // Save the PDF Blob as a ContentVersion
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = 'ApplicationPreview';
            contentVersion.PathOnClient = 'ApplicationPreview.pdf';
            contentVersion.VersionData = pdfBlob;
            contentVersion.FirstPublishLocationId = recordId;
            insert contentVersion;

            return true;
        } catch (Exception e) {
            System.debug('Error in saveVFPageToRecord: ' + e.getMessage());
            return false;
        }
    }
}