# Deploying Pixel Knight Adventure to GitHub Pages

This guide will help you deploy your game to GitHub Pages so others can play it online.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your game repository pushed to GitHub

## Steps to Deploy

1. **Go to your repository on GitHub**

   Navigate to your repository page on GitHub.

2. **Go to Settings**

   Click on the "Settings" tab at the top of your repository page.

3. **Navigate to Pages**

   In the left sidebar, click on "Pages".

4. **Configure Source**

   Under "Source", select the branch you want to deploy (usually "main" or "master").
   
   Select the folder (usually "/ (root)").
   
   Click "Save".

5. **Wait for Deployment**

   GitHub will start building your site. This might take a few minutes.

6. **Access Your Game**

   Once deployed, you'll see a message saying "Your site is published at https://yourusername.github.io/pixel-knight-adventure/".
   
   Click on the link to access your game.

7. **Update README**

   Update the "Play Online" link in your README.md file to point to your GitHub Pages URL.

## Troubleshooting

- If your game doesn't appear, make sure all file paths are correct.
- Check that all your files are committed and pushed to the branch you selected for GitHub Pages.
- If images or resources don't load, make sure they use relative paths.

## Custom Domain (Optional)

If you want to use a custom domain:

1. In the GitHub Pages settings, enter your custom domain in the "Custom domain" field.
2. Update your domain's DNS settings to point to GitHub Pages.
3. Wait for DNS propagation (can take up to 48 hours).

## Updating Your Game

To update your game:

1. Make changes to your local files.
2. Commit and push the changes to GitHub.
3. GitHub Pages will automatically update your site. 