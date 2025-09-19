import React, { useCallback, useState, useRef } from 'react'
import { Upload, FileText, Video, Image, X, CheckCircle, AlertCircle, Eye, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RocButton } from './roc-button'
import { Badge } from './badge'
import { Progress } from './progress'
import { useToast } from '@/hooks/use-toast'
import { applicationService } from '@/services/applicationService'

interface DocumentUploadProps {
  /** Unique identifier for the upload component */
  id: string
  /** Label for the upload area */
  label: string
  /** Description text shown below the label */
  description?: string
  /** File types accepted (e.g., 'image/*', '.pdf,.jpg,.png') */
  accept: string
  /** Maximum file size in bytes */
  maxSize?: number
  /** Type of document for backend processing */
  documentType: 'id' | 'video' | 'income' | 'guardian-id'
  /** Current file (if any) */
  file?: File
  /** Current uploaded file URL (if any) */
  fileUrl?: string
  /** Callback when file changes */
  onFileChange: (file: File | undefined, url?: string) => void
  /** Whether upload is required */
  required?: boolean
  /** Whether component is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to show preview functionality */
  showPreview?: boolean
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  id,
  label,
  description,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  documentType,
  file,
  fileUrl,
  onFileChange,
  required = false,
  disabled = false,
  className = '',
  showPreview = true,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Get file type category for display
  const getFileCategory = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (mimeType?.startsWith('video/') || ['mp4', 'mov', 'avi', 'webm'].includes(extension || '')) {
      return 'video'
    }
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image'
    }
    return 'document'
  }

  // Get appropriate icon for file type
  const getFileIcon = (fileName: string, mimeType?: string) => {
    const category = getFileCategory(fileName, mimeType)
    switch (category) {
      case 'video':
        return Video
      case 'image':
        return Image
      default:
        return FileText
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Validate file before processing
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const mimeType = file.type

      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension
        }
        if (acceptedType.includes('*')) {
          const baseType = acceptedType.split('/')[0]
          return mimeType.startsWith(baseType)
        }
        return acceptedType === mimeType
      })

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`
      }
    }

    return null
  }

  // Handle file upload to backend
  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await applicationService.uploadDocument(file, documentType)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)

      return response.data.url
    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      throw error
    }
  }

  // Process selected file
  const processFile = async (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    try {
      const uploadedUrl = await uploadFile(selectedFile)
      onFileChange(selectedFile, uploadedUrl)
      
      toast({
        title: 'File uploaded successfully',
        description: `${selectedFile.name} has been uploaded.`,
      })
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [disabled])

  // Handle remove file
  const handleRemoveFile = () => {
    onFileChange(undefined, undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle click to select file
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  // Handle preview
  const handlePreview = () => {
    if (file || fileUrl) {
      setPreviewOpen(true)
    }
  }

  const hasFile = !!(file || fileUrl)
  const FileIcon = file ? getFileIcon(file.name, file.type) : FileText

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {hasFile && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Upload Area */}
      {!hasFile ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
            'hover:border-primary hover:bg-primary/5',
            isDragging && 'border-primary bg-primary/10',
            disabled && 'opacity-50 cursor-not-allowed',
            isUploading && 'pointer-events-none'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {formatFileSize(maxSize)}
                </p>
                {accept && (
                  <p className="text-xs text-muted-foreground">
                    Accepted: {accept}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* File Display */
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {file?.name || 'Uploaded file'}
              </p>
              {file && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              )}
            </div>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {showPreview && (file || fileUrl) && (
              <RocButton
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </RocButton>
            )}
            <RocButton
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </RocButton>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Preview Modal would go here - simplified for now */}
      {previewOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="bg-background p-4 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Preview</h3>
              <RocButton
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </RocButton>
            </div>
            
            {file && getFileCategory(file.name, file.type) === 'image' ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="max-w-full max-h-96 object-contain mx-auto"
              />
            ) : file && getFileCategory(file.name, file.type) === 'video' ? (
              <video 
                src={URL.createObjectURL(file)} 
                controls 
                className="max-w-full max-h-96 mx-auto"
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 