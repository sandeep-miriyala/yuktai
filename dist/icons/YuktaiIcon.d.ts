import { type IconProps } from "./IconBase";
import { type IconName } from "./paths";
export interface YuktaiIconProps extends Omit<IconProps, "name"> {
    /** Icon name, e.g. "mic", "wand", "accessibility". See ICON_NAMES. */
    name: IconName;
}
/** Any yuktai icon by name. Paths are fixed constants from paths.ts (never user input). */
export declare function YuktaiIcon({ name, ...props }: YuktaiIconProps): import("react").JSX.Element;
/** Accessibility settings */
export declare const AccessibilityIcon: (props: IconProps) => import("react").JSX.Element;
/** High contrast */
export declare const ContrastIcon: (props: IconProps) => import("react").JSX.Element;
/** Dark mode */
export declare const MoonIcon: (props: IconProps) => import("react").JSX.Element;
/** Reduce motion */
export declare const MotionIcon: (props: IconProps) => import("react").JSX.Element;
/** Reading / dyslexia support */
export declare const ReadingIcon: (props: IconProps) => import("react").JSX.Element;
/** Large targets */
export declare const TargetIcon: (props: IconProps) => import("react").JSX.Element;
/** Speak on focus */
export declare const SpeakerIcon: (props: IconProps) => import("react").JSX.Element;
/** Colour-blind modes */
export declare const PaletteIcon: (props: IconProps) => import("react").JSX.Element;
/** Skip links */
export declare const SkipIcon: (props: IconProps) => import("react").JSX.Element;
/** Increase / add */
export declare const PlusIcon: (props: IconProps) => import("react").JSX.Element;
/** Decrease / remove */
export declare const MinusIcon: (props: IconProps) => import("react").JSX.Element;
/** Reset */
export declare const ResetIcon: (props: IconProps) => import("react").JSX.Element;
/** Sortable column (unsorted) */
export declare const SortIcon: (props: IconProps) => import("react").JSX.Element;
/** Expand / collapse */
export declare const ChevronsIcon: (props: IconProps) => import("react").JSX.Element;
/** Table view */
export declare const GridIcon: (props: IconProps) => import("react").JSX.Element;
/** Card view */
export declare const CardsIcon: (props: IconProps) => import("react").JSX.Element;
/** Ask / assistant */
export declare const ChatIcon: (props: IconProps) => import("react").JSX.Element;
/** Voice input */
export declare const MicIcon: (props: IconProps) => import("react").JSX.Element;
/** Stop listening */
export declare const StopIcon: (props: IconProps) => import("react").JSX.Element;
/** Download / export / install */
export declare const DownloadIcon: (props: IconProps) => import("react").JSX.Element;
/** Copy */
export declare const CopyIcon: (props: IconProps) => import("react").JSX.Element;
/** Filter */
export declare const FilterIcon: (props: IconProps) => import("react").JSX.Element;
/** First page */
export declare const FirstIcon: (props: IconProps) => import("react").JSX.Element;
/** Last page */
export declare const LastIcon: (props: IconProps) => import("react").JSX.Element;
/** AI / agentic answer */
export declare const SparkIcon: (props: IconProps) => import("react").JSX.Element;
/** Warning */
export declare const AlertIcon: (props: IconProps) => import("react").JSX.Element;
/** Information */
export declare const InfoIcon: (props: IconProps) => import("react").JSX.Element;
/** Form review */
export declare const FormIcon: (props: IconProps) => import("react").JSX.Element;
/** Show on page / watch */
export declare const EyeIcon: (props: IconProps) => import("react").JSX.Element;
/** Design review */
export declare const LayoutIcon: (props: IconProps) => import("react").JSX.Element;
/** Auto-fix */
export declare const WandIcon: (props: IconProps) => import("react").JSX.Element;
/** Undo */
export declare const UndoIcon: (props: IconProps) => import("react").JSX.Element;
/** Page tools */
export declare const ToolsIcon: (props: IconProps) => import("react").JSX.Element;
/** WebMCP / integrations */
export declare const PlugIcon: (props: IconProps) => import("react").JSX.Element;
/** Home */
export declare const HomeIcon: (props: IconProps) => import("react").JSX.Element;
/** Menu */
export declare const MenuIcon: (props: IconProps) => import("react").JSX.Element;
/** Book */
export declare const BookIcon: (props: IconProps) => import("react").JSX.Element;
/** Calendar */
export declare const CalendarIcon: (props: IconProps) => import("react").JSX.Element;
/** Clock */
export declare const ClockIcon: (props: IconProps) => import("react").JSX.Element;
/** Person */
export declare const PersonIcon: (props: IconProps) => import("react").JSX.Element;
/** Group of people */
export declare const UsersIcon: (props: IconProps) => import("react").JSX.Element;
/** Language / world */
export declare const GlobeIcon: (props: IconProps) => import("react").JSX.Element;
/** Oil lamp (deepam) */
export declare const LampIcon: (props: IconProps) => import("react").JSX.Element;
/** Play */
export declare const PlayIcon: (props: IconProps) => import("react").JSX.Element;
/** Pause */
export declare const PauseIcon: (props: IconProps) => import("react").JSX.Element;
/** Send */
export declare const SendIcon: (props: IconProps) => import("react").JSX.Element;
/** Share */
export declare const ShareIcon: (props: IconProps) => import("react").JSX.Element;
/** Gift */
export declare const GiftIcon: (props: IconProps) => import("react").JSX.Element;
/** Image */
export declare const ImageIcon: (props: IconProps) => import("react").JSX.Element;
/** File / document */
export declare const FileIcon: (props: IconProps) => import("react").JSX.Element;
/** Opens in a new tab */
export declare const ExternalIcon: (props: IconProps) => import("react").JSX.Element;
/** Arrow up */
export declare const ArrowUpIcon: (props: IconProps) => import("react").JSX.Element;
/** Arrow left */
export declare const ArrowLeftIcon: (props: IconProps) => import("react").JSX.Element;
/** Arrow right */
export declare const ArrowRightIcon: (props: IconProps) => import("react").JSX.Element;
/** Headphones / listen */
export declare const HeadphonesIcon: (props: IconProps) => import("react").JSX.Element;
/** Music / audio */
export declare const MusicIcon: (props: IconProps) => import("react").JSX.Element;
/** Location pin */
export declare const PinIcon: (props: IconProps) => import("react").JSX.Element;
/** Map / directions */
export declare const MapIcon: (props: IconProps) => import("react").JSX.Element;
/** Pen / write */
export declare const PenIcon: (props: IconProps) => import("react").JSX.Element;
/** Wallet / money */
export declare const WalletIcon: (props: IconProps) => import("react").JSX.Element;
/** Install app */
export declare const InstallIcon: (props: IconProps) => import("react").JSX.Element;
/** Help */
export declare const HelpIcon: (props: IconProps) => import("react").JSX.Element;
/** Temple */
export declare const TempleIcon: (props: IconProps) => import("react").JSX.Element;
/** Meditation */
export declare const MeditateIcon: (props: IconProps) => import("react").JSX.Element;
/** Trophy / result */
export declare const TrophyIcon: (props: IconProps) => import("react").JSX.Element;
/** Idea / tip */
export declare const BulbIcon: (props: IconProps) => import("react").JSX.Element;
/** Sun / light mode */
export declare const SunIcon: (props: IconProps) => import("react").JSX.Element;
/** Delete */
export declare const DeleteIcon: (props: IconProps) => import("react").JSX.Element;
/** Robot / AI assistant */
export declare const RobotIcon: (props: IconProps) => import("react").JSX.Element;
/** Heart (not liked) */
export declare const HeartIcon: (props: IconProps) => import("react").JSX.Element;
/** Heart (liked) */
export declare const HeartFilledIcon: (props: IconProps) => import("react").JSX.Element;
/** Hub / network */
export declare const HubIcon: (props: IconProps) => import("react").JSX.Element;
/** Code */
export declare const CodeIcon: (props: IconProps) => import("react").JSX.Element;
/** Text field */
export declare const TextIcon: (props: IconProps) => import("react").JSX.Element;
/** Bold */
export declare const BoldIcon: (props: IconProps) => import("react").JSX.Element;
/** Italic */
export declare const ItalicIcon: (props: IconProps) => import("react").JSX.Element;
/** Underline */
export declare const UnderlineIcon: (props: IconProps) => import("react").JSX.Element;
/** Align left */
export declare const AlignLeftIcon: (props: IconProps) => import("react").JSX.Element;
/** Align centre */
export declare const AlignCenterIcon: (props: IconProps) => import("react").JSX.Element;
/** Align right */
export declare const AlignRightIcon: (props: IconProps) => import("react").JSX.Element;
/** Justify */
export declare const AlignJustifyIcon: (props: IconProps) => import("react").JSX.Element;
/** Quote */
export declare const QuoteIcon: (props: IconProps) => import("react").JSX.Element;
/** Title */
export declare const TitleIcon: (props: IconProps) => import("react").JSX.Element;
/** Font */
export declare const FontIcon: (props: IconProps) => import("react").JSX.Element;
/** Spell check */
export declare const SpellcheckIcon: (props: IconProps) => import("react").JSX.Element;
/** Letters (ABC) */
export declare const AbcIcon: (props: IconProps) => import("react").JSX.Element;
/** Page break */
export declare const PageBreakIcon: (props: IconProps) => import("react").JSX.Element;
/** Link */
export declare const LinkIcon: (props: IconProps) => import("react").JSX.Element;
/** Style */
export declare const StyleIcon: (props: IconProps) => import("react").JSX.Element;
/** Lock */
export declare const LockIcon: (props: IconProps) => import("react").JSX.Element;
/** Unlock */
export declare const UnlockIcon: (props: IconProps) => import("react").JSX.Element;
/** Key */
export declare const KeyIcon: (props: IconProps) => import("react").JSX.Element;
/** Redo */
export declare const RedoIcon: (props: IconProps) => import("react").JSX.Element;
/** Swap */
export declare const SwapIcon: (props: IconProps) => import("react").JSX.Element;
/** Shuffle */
export declare const ShuffleIcon: (props: IconProps) => import("react").JSX.Element;
/** Full screen */
export declare const FullscreenIcon: (props: IconProps) => import("react").JSX.Element;
/** Exit full screen */
export declare const FullscreenExitIcon: (props: IconProps) => import("react").JSX.Element;
/** Merge */
export declare const MergeIcon: (props: IconProps) => import("react").JSX.Element;
/** Join */
export declare const JoinIcon: (props: IconProps) => import("react").JSX.Element;
/** Tap / touch */
export declare const TouchIcon: (props: IconProps) => import("react").JSX.Element;
/** Sound off */
export declare const VolumeOffIcon: (props: IconProps) => import("react").JSX.Element;
/** Music off */
export declare const MusicOffIcon: (props: IconProps) => import("react").JSX.Element;
/** Music video */
export declare const MusicVideoIcon: (props: IconProps) => import("react").JSX.Element;
/** Movie */
export declare const MovieIcon: (props: IconProps) => import("react").JSX.Element;
/** Slide show */
export declare const SlideshowIcon: (props: IconProps) => import("react").JSX.Element;
/** Storage / database */
export declare const StorageIcon: (props: IconProps) => import("react").JSX.Element;
/** API */
export declare const ApiIcon: (props: IconProps) => import("react").JSX.Element;
/** Data object { } */
export declare const DataObjectIcon: (props: IconProps) => import("react").JSX.Element;
/** Computer */
export declare const ComputerIcon: (props: IconProps) => import("react").JSX.Element;
/** Phone */
export declare const PhoneIcon: (props: IconProps) => import("react").JSX.Element;
/** Cloud */
export declare const CloudIcon: (props: IconProps) => import("react").JSX.Element;
/** Wi-Fi */
export declare const WifiIcon: (props: IconProps) => import("react").JSX.Element;
/** No Wi-Fi / offline */
export declare const WifiOffIcon: (props: IconProps) => import("react").JSX.Element;
/** No results */
export declare const SearchOffIcon: (props: IconProps) => import("react").JSX.Element;
/** Hide */
export declare const EyeOffIcon: (props: IconProps) => import("react").JSX.Element;
/** Bookmark */
export declare const BookmarkIcon: (props: IconProps) => import("react").JSX.Element;
/** School / learning */
export declare const SchoolIcon: (props: IconProps) => import("react").JSX.Element;
/** Law / rules */
export declare const GavelIcon: (props: IconProps) => import("react").JSX.Element;
/** Architecture / design */
export declare const ArchitectureIcon: (props: IconProps) => import("react").JSX.Element;
/** Brain / thinking */
export declare const BrainIcon: (props: IconProps) => import("react").JSX.Element;
/** Volunteer / care */
export declare const VolunteerIcon: (props: IconProps) => import("react").JSX.Element;
/** Radio button (off) */
export declare const RadioIcon: (props: IconProps) => import("react").JSX.Element;
/** Radio button (on) */
export declare const RadioCheckedIcon: (props: IconProps) => import("react").JSX.Element;
/** Upload */
export declare const UploadIcon: (props: IconProps) => import("react").JSX.Element;
/** Arrow down */
export declare const ArrowDownIcon: (props: IconProps) => import("react").JSX.Element;
/** Fact check / checklist */
export declare const FactCheckIcon: (props: IconProps) => import("react").JSX.Element;
/** Image search */
export declare const ImageSearchIcon: (props: IconProps) => import("react").JSX.Element;
/** Document scanner / OCR */
export declare const DocumentScannerIcon: (props: IconProps) => import("react").JSX.Element;
/** Dashboard */
export declare const DashboardIcon: (props: IconProps) => import("react").JSX.Element;
/** Clean up */
export declare const CleaningIcon: (props: IconProps) => import("react").JSX.Element;
/** Drag handle */
export declare const DragHandleIcon: (props: IconProps) => import("react").JSX.Element;
/** Zoom in */
export declare const ZoomInIcon: (props: IconProps) => import("react").JSX.Element;
/** Zoom out */
export declare const ZoomOutIcon: (props: IconProps) => import("react").JSX.Element;
/** Insights */
export declare const InsightsIcon: (props: IconProps) => import("react").JSX.Element;
/** Explore / compass */
export declare const ExploreIcon: (props: IconProps) => import("react").JSX.Element;
/** Save */
export declare const SaveIcon: (props: IconProps) => import("react").JSX.Element;
/** Label */
export declare const LabelIcon: (props: IconProps) => import("react").JSX.Element;
/** Keyboard */
export declare const KeyboardIcon: (props: IconProps) => import("react").JSX.Element;
/** Trending up */
export declare const TrendingUpIcon: (props: IconProps) => import("react").JSX.Element;
/** Trending down */
export declare const TrendingDownIcon: (props: IconProps) => import("react").JSX.Element;
/** Birthday / cake */
export declare const CakeIcon: (props: IconProps) => import("react").JSX.Element;
/** Bar chart */
export declare const BarChartIcon: (props: IconProps) => import("react").JSX.Element;
/** Admin */
export declare const AdminIcon: (props: IconProps) => import("react").JSX.Element;
/** Bug report */
export declare const BugReportIcon: (props: IconProps) => import("react").JSX.Element;
/** Sad / not happy */
export declare const SentimentSadIcon: (props: IconProps) => import("react").JSX.Element;
/** Integration / code snippet */
export declare const IntegrationIcon: (props: IconProps) => import("react").JSX.Element;
/** Namaskar (praying hands) */
export declare const NamaskarIcon: (props: IconProps) => import("react").JSX.Element;
/** Sunrise */
export declare const SunriseIcon: (props: IconProps) => import("react").JSX.Element;
/** Sunset */
export declare const SunsetIcon: (props: IconProps) => import("react").JSX.Element;
/** Log in */
export declare const LoginIcon: (props: IconProps) => import("react").JSX.Element;
/** Log out */
export declare const LogoutIcon: (props: IconProps) => import("react").JSX.Element;
/** Speed */
export declare const SpeedIcon: (props: IconProps) => import("react").JSX.Element;
/** Repeat */
export declare const RepeatIcon: (props: IconProps) => import("react").JSX.Element;
/** Loading */
export declare const LoaderIcon: (props: IconProps) => import("react").JSX.Element;
/** Star / favourite */
export declare const StarIcon: (props: IconProps) => import("react").JSX.Element;
/** Safe / verified */
export declare const ShieldCheckIcon: (props: IconProps) => import("react").JSX.Element;
