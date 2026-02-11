"use client";

import { useState } from "react";
import RichTextEditor from "@/components/rich-text-editor";

type InitialValues = {
  title: string;
  contentHtml: string;
  spotifyUrl: string;
  isPublished: boolean;
};

type FormAction = (formData: FormData) => void | Promise<void>;

const defaultValues: InitialValues = {
  title: "",
  contentHtml: "<p></p>",
  spotifyUrl: "",
  isPublished: false
};

export default function AdminPostForm({
  action,
  submitLabel,
  initialValues = defaultValues
}: {
  action: FormAction;
  submitLabel: string;
  initialValues?: InitialValues;
}) {
  const [contentHtml, setContentHtml] = useState(initialValues.contentHtml);

  return (
    <form action={action} className="admin-form post-form">
      <label>
        Title
        <input
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={180}
          defaultValue={initialValues.title}
        />
      </label>

      <label>
        Spotify Playlist URL
        <input
          name="spotifyUrl"
          type="url"
          required
          placeholder="https://open.spotify.com/playlist/..."
          defaultValue={initialValues.spotifyUrl}
        />
      </label>

      <label>
        Content
        <RichTextEditor value={contentHtml} onChange={setContentHtml} />
        <input type="hidden" name="contentHtml" value={contentHtml} />
      </label>

      <label className="inline-checkbox">
        <input name="isPublished" type="checkbox" defaultChecked={initialValues.isPublished} />
        Publish now
      </label>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
