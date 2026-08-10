import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VideoPlayer } from '@/components/video/video-player'

describe('VideoPlayer', () => {
  it('renderiza el video con controlsList=nodownload y bloquea clic derecho', () => {
    const { container } = render(
      <VideoPlayer url="https://cdn.example.com/v.mp4" onResolve={vi.fn()} />,
    )
    const video = container.querySelector('video')
    expect(video).toBeTruthy()
    expect(video?.getAttribute('controlsList')).toBe('nodownload')
    expect(video?.getAttribute('draggable')).toBe('false')

    // Context menu preventDefault
    const ctx = new MouseEvent('contextmenu', { cancelable: true, bubbles: true })
    container.firstElementChild?.dispatchEvent(ctx)
    expect(ctx.defaultPrevented).toBe(true)
  })

  it('muestra mensaje en español + Reintentar cuando la URL expiró', async () => {
    const onResolve = vi.fn().mockResolvedValue('https://cdn.example.com/new.mp4')
    const { container } = render(
      <VideoPlayer
        url="https://cdn.example.com/v.mp4"
        expiresAt={new Date(Date.now() - 1000).toISOString()}
        onResolve={onResolve}
      />,
    )
    const video = container.querySelector('video') as HTMLVideoElement
    fireEvent.error(video)

    expect(screen.getByText(/La URL del video expiró/i)).toBeTruthy()
    const retry = screen.getByRole('button', { name: /reintentar/i })
    fireEvent.click(retry)
    await waitFor(() => expect(onResolve).toHaveBeenCalled())
  })

  it('muestra video no disponible si la URL está vacía', () => {
    render(<VideoPlayer url="" onResolve={vi.fn()} />)
    expect(screen.getByText(/Video no disponible/i)).toBeTruthy()
  })
})
