import { open, LaunchProps } from "@raycast/api";

export default async function Command(props: LaunchProps<{ arguments: { keyword: string } }>) {
  const keyword = props.arguments.keyword?.trim();
  const url = keyword ? `https://sliplane.io/blog?search=${encodeURIComponent(keyword)}` : "https://sliplane.io/blog";
  await open(url);
}
