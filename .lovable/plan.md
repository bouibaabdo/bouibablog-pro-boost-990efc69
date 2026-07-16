Plan: Publish latest updates to the live site

1. Verify security scan status
   - All active scanners report zero findings.
   - No critical issues block publishing.

2. Trigger deployment
   - Call preview_ui--publish to deploy the latest committed changes.
   - The site is already public, so no visibility change is needed.

3. Confirm live URL
   - Report the published URL(s) once the deployment is scheduled.
   - Note that custom domain propagation/SSL may take a minute or two.

Expected outcome: the latest code updates go live at the existing public URLs.