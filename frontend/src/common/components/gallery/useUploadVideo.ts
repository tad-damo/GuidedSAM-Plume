/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Modifications Copyright (c) 2025
 * Université Lumière Lyon 2, CNRS, Ecole Centrale de Lyon, INSA Lyon, Universite Claude Bernard Lyon 1, LIRIS, UMR5205, 69007 Lyon, France
 *
 * Authors
 * Contributors: Taddeo D'ADAMO (GitHub: @tad-damo)
 * Advisors: Laure TOUGNE RODET(GitHub: @lauretougne), Catherine POTHIER (GitHub: @CathImage27), Bertrand KERAUTRET (GitHub: @kerautret)
 *
 *
 * Modifications:
 * - Updated `useUploadVideo` to support multiple file uploads (`multiple: true`) instead of a single file.
 * - Updated `onUpload` to handle an array of `VideoData` instead of a single `VideoData`.
 * - Expanded accepted file types to include additional media types (images and zip files) for segmenter use.
 * - Updated GraphQL mutation response to include `frames` and `originalName` for segmenter-specific processing.
 * - Adjusted upload handling to use `Promise.all` to await multiple uploads before calling `onUpload`.
 * - Removed max file size restriction
 */
import {useUploadVideoMutation} from '@/common/components/gallery/__generated__/useUploadVideoMutation.graphql';
import Logger from '@/common/logger/Logger';
import {VideoData} from '@/segmenter/atoms';
import {useState} from 'react';
import {FileRejection, FileWithPath, useDropzone} from 'react-dropzone';
import {graphql, useMutation} from 'react-relay';

const ACCEPT_MEDIA = {
  // Videos
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'application/zip': ['.zip'],

  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tif', '.tiff'],
};

type Props = {
  onUpload: (videos: VideoData[]) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: Error) => void;
};

export default function useUploadVideo({
  onUpload,
  onUploadStart,
  onUploadError,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [commit, isMutationInFlight] = useMutation<useUploadVideoMutation>(
    graphql`
      mutation useUploadVideoMutation($file: Upload!) {
        uploadVideo(file: $file) {
          id
          height
          width
          url
          path
          posterPath
          frames
          posterUrl
          originalName
        }
      }
    `,
  );

  const {getRootProps, getInputProps} = useDropzone({
    accept: ACCEPT_MEDIA,
    multiple: true,
    onDrop: async (
      acceptedFiles: FileWithPath[],
      fileRejections: FileRejection[],
    ) => {
      setError(null);

      if (fileRejections.length > 0) {
        setError('Some files were rejected. Please try again.');
        return;
      }

      if (acceptedFiles.length === 0) {
        setError('No files accepted. Please try again.');
        return;
      }

      onUploadStart?.();

      try {
        const uploadPromises = acceptedFiles.map(
          file =>
            new Promise<VideoData>((resolve, reject) => {
              commit({
                variables: {file},
                uploadables: {file},
                onCompleted: res => {
                  if (res?.uploadVideo) {
                    const videoData = {
                      ...res.uploadVideo,
                      frames: res.uploadVideo.frames
                        ? [...res.uploadVideo.frames]
                        : null,
                    };
                    resolve(videoData);
                  } else {
                    reject(new Error('Upload failed with empty response'));
                  }
                },
                onError: err => reject(err),
              });
            }),
        );

        const uploadedVideos = await Promise.all(uploadPromises);

        onUpload(uploadedVideos);
      } catch (err) {
        Logger.error(err);
        onUploadError?.(err as Error);
        setError('Upload failed.');
      }
    },
    onError: error => {
      Logger.error(error);
      setError('File not supported.');
    },
  });

  return {
    getRootProps,
    getInputProps,
    isUploading: isMutationInFlight,
    error,
    setError,
  };
}
