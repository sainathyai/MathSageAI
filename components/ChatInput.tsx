'use client'

import { useState, useRef, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, X, HelpCircle, Lightbulb, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void
  disabled?: boolean
  showSuggestions?: boolean
}

const suggestedResponses = [
  { text: "I don't know", icon: HelpCircle, color: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200" },
  { text: "Give me a hint", icon: Lightbulb, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  { text: "I'm unsure", icon: Info, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200" },
  { text: "Can you explain more?", icon: HelpCircle, color: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200" },
]

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ onSendMessage, disabled = false, showSuggestions = false }, ref) => {
    const [message, setMessage] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSuggestionClick = (suggestion: string) => {
      setMessage(suggestion)
      // Auto-focus the textarea so user can edit if needed
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus()
      }
    }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Log file details for debugging
      console.log('📸 Image selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
      })
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp']
      
      // Check for HEIC/HEIF by extension or MIME type
      if (fileExtension === 'heic' || fileExtension === 'heif' || file.type === 'image/heic' || file.type === 'image/heif') {
        console.error('❌ HEIC/HEIF format detected:', {
          fileType: file.type,
          fileExtension: fileExtension,
        })
        alert('HEIC/HEIF format is not supported. Please convert your image to PNG or JPEG. You can do this by opening the image and saving it as PNG or JPEG format.')
        return
      }
      
      // Check actual file content (not just extension) for HEIC format
      // Read first few bytes to detect actual format
      try {
        const arrayBuffer = await file.slice(0, 20).arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const hexString = Array.from(uint8Array)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        
        // Convert to string to check for 'ftyp' signature
        const textStart = Array.from(uint8Array.slice(4, 12))
          .map(b => String.fromCharCode(b))
          .join('')
        
        console.log('🔍 File binary signature check:', {
          hex: hexString.substring(0, 32),
          text: textStart,
          bytes4_7: `${uint8Array[4]},${uint8Array[5]},${uint8Array[6]},${uint8Array[7]}`,
        })
        
        // Check for HEIC/HEIF/AVIF magic numbers
        // HEIC files have 'ftyp' at bytes 4-7, followed by 'heic', 'heif', 'mif1', or 'avif'
        const isHEIC = textStart.includes('ftyp') && (textStart.includes('heic') || textStart.includes('heif') || textStart.includes('mif1')) ||
                       hexString.includes('6674797068656966') || // 'ftypheif' in hex
                       hexString.includes('667479706d696631') || // 'ftypmif1' in hex
                       hexString.includes('6674797068656963') || // 'ftypheic' in hex
                       (uint8Array[4] === 0x66 && uint8Array[5] === 0x74 && uint8Array[6] === 0x79 && uint8Array[7] === 0x70 && 
                        (uint8Array[8] === 0x68 && uint8Array[9] === 0x65 && uint8Array[10] === 0x69 && uint8Array[11] === 0x63)) // 'ftypheic'
        
        const isAVIF = textStart.includes('avif') || hexString.includes('6674797061766966') // 'ftypavif' in hex
        
        if (isHEIC) {
          console.error('❌ HEIC/HEIF format detected in file content (even though extension is .png):', {
            fileType: file.type,
            fileExtension: fileExtension,
            hexSignature: hexString.substring(0, 32),
            textSignature: textStart,
            bytes: Array.from(uint8Array).join(',')
          })
          alert('This file appears to be in HEIC/HEIF format even though it has a .png extension. Simply renaming the file doesn\'t convert it. Please open the image in an image editor (like Photos on Mac, Paint on Windows, or an online converter) and save/export it as PNG or JPEG format.')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }
        
        if (isAVIF) {
          console.error('❌ AVIF format detected in file content (even though extension is .png):', {
            fileType: file.type,
            fileExtension: fileExtension,
            hexSignature: hexString.substring(0, 32),
            textSignature: textStart,
            bytes: Array.from(uint8Array).join(',')
          })
          alert('This file appears to be in AVIF format even though it has a .png extension. AVIF is not supported. Please open the image in an image editor and save/export it as PNG or JPEG format.')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }
      } catch (error) {
        console.warn('⚠️ Could not read file content for format detection:', error)
        // Continue with extension-based validation if we can't read the file
      }
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        console.error('❌ Unsupported image format:', {
          fileType: file.type,
          fileExtension: fileExtension,
          allowedTypes: allowedTypes,
          allowedExtensions: allowedExtensions,
        })
        alert(`Unsupported image format. Please use one of: ${allowedExtensions.join(', ')}`)
        return
      }
      
      console.log('✅ Image format validated successfully')
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (!message.trim() && !selectedImage) return

    onSendMessage(message, selectedImage || undefined)
    setMessage('')
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (ref && 'current' in ref && ref.current) {
      ref.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-slate-200/50 bg-gradient-input p-4 backdrop-blur-sm">
      <div className="container max-w-4xl mx-auto">
        {/* Suggested Responses */}
        {showSuggestions && !imagePreview && (
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedResponses.map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    disabled={disabled}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      suggestion.color,
                      "hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {suggestion.text}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 max-w-xs">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-auto"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={ref}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your math problem or question..."
              disabled={disabled}
              className={cn(
                "min-h-[60px] max-h-32 resize-none pr-12",
                "focus-visible:ring-indigo-600"
              )}
            />
            
            {/* Image Upload Button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute bottom-2 right-2 h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={disabled || (!message.trim() && !selectedImage)}
            className="bg-gradient-brand hover:opacity-90 text-white border-0 shadow-md h-[60px] px-6 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

