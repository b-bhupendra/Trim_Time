
export interface SocialProfileData {
  platform: 'instagram' | 'facebook';
  handle: string;
  displayName: string;
  profilePicUrl: string;
  bio: string;
  followers: number;
  posts: {
    id: string;
    imageUrl: string;
    caption: string;
    likes: number;
    url: string;
  }[];
}

/**
 * Service to fetch public social media profile data.
 * Note: Real-time fetching from IG/FB often requires a dedicated API key 
 * due to strict anti-scraping measures. This service provides a structure 
 * that can be integrated with services like RapidAPI or official Graph APIs.
 */
export const fetchSocialProfile = async (platform: 'instagram' | 'facebook', handle: string): Promise<SocialProfileData> => {
  // In a real implementation, this would call a backend route or a third-party API.
  // For now, we'll provide high-quality mock data that matches the requested handles
  // to demonstrate the UI integration.
  
  console.log(`Fetching ${platform} data for ${handle}...`);
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock data generation based on handle
  if (platform === 'instagram') {
    return {
      platform: 'instagram',
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1) + ' Styles',
      profilePicUrl: `https://picsum.photos/seed/${handle}/200/200`,
      bio: `Official ${handle} portfolio. Premium grooming & lifestyle. ✂️🔥`,
      followers: 12500,
      posts: [
        {
          id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
          caption: 'Fresh fade for the weekend. #barber #style',
          likes: 450,
          url: `https://instagram.com/p/mock1`
        },
        {
          id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1621605815841-aa88c82b022c?q=80&w=800&auto=format&fit=crop',
          caption: 'Precision is everything. #trimtime',
          likes: 320,
          url: `https://instagram.com/p/mock2`
        },
        {
          id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop',
          caption: 'Classic look, modern touch.',
          likes: 280,
          url: `https://instagram.com/p/mock3`
        },
        {
          id: '4',
          imageUrl: 'https://images.unsplash.com/photo-1599351431247-f5793384797d?q=80&w=800&auto=format&fit=crop',
          caption: 'The art of the shave.',
          likes: 510,
          url: `https://instagram.com/p/mock4`
        }
      ]
    };
  } else {
    return {
      platform: 'facebook',
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1) + ' Grooming',
      profilePicUrl: `https://picsum.photos/seed/${handle}-fb/200/200`,
      bio: `Welcome to our official Facebook page. Book your appointment today!`,
      followers: 8400,
      posts: [
        {
          id: 'fb1',
          imageUrl: 'https://images.unsplash.com/photo-1512690118294-70036713081b?q=80&w=800&auto=format&fit=crop',
          caption: 'Check out our new studio location!',
          likes: 120,
          url: `https://facebook.com/mock1`
        }
      ]
    };
  }
};
