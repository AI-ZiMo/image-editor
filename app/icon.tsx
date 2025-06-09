import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6 12.2L8.8 5.2C8.7 5 8.5 4.9 8.3 4.9C8.1 4.9 7.9 5 7.8 5.2L5 12.2C4.9 12.4 5 12.6 5.2 12.7C5.3 12.7 5.3 12.7 5.4 12.7H8.8M11.6 12.2L15.2 5.2C15.3 5 15.5 4.9 15.7 4.9C15.9 4.9 16.1 5 16.2 5.2L19 12.2C19.1 12.4 19 12.6 18.8 12.7C18.7 12.7 18.7 12.7 18.6 12.7H15.2M11.6 12.2L12 19.1C12 19.3 12.2 19.5 12.4 19.5C12.6 19.5 12.8 19.3 12.8 19.1L13.2 12.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
} 