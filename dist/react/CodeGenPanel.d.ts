import React from "react";
interface Props {
    position: "left" | "right";
    onClose: () => void;
}
export default function CodeGenPanel({ position, onClose }: Props): React.JSX.Element;
export {};
