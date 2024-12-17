import { Component, createSignal } from "solid-js";
import { usePortraitConfig } from "../../context/portraitConfigProvider";
import ImageCanvas from "./ImageCanvas";

interface PreviewProps {
  name: string;
  text: string;
}

const LivePreview: Component<PreviewProps> = (props) => {
  const { config } = usePortraitConfig();
  const [box, setBox] = createSignal<string>(config.boxType);

  return (
    <div class="absolute bottom-4 left-4 w-[50rem] max-h-[300px] overflow-y-auto bg-secondary text-text p-1">
      <p class="text-zinc-400 text-sm font-medium select-none">Live preview</p>
      <ImageCanvas
        portrait={`/assets/portraits/ann2.png`}
        name={props.name}
        text={props.text}
        font="Optima"
        char={"Takemi"}
        emote=""
        costume=""
        box={"/assets/" + box() + ".png"}
        setBox={setBox}
        setBoxSize={() => {}}
        boxType={config.boxType}
      />
    </div>
  );
};

export default LivePreview;
