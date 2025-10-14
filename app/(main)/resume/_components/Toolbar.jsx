"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { fonts } from '@/data/editor'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/use-editor-store'
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ChevronDownIcon, HighlighterIcon, ImageIcon, ItalicIcon, Link2Icon, ListTodoIcon, MoveVertical, PrinterIcon, Redo2Icon, RemoveFormattingIcon, SearchIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon, Upload } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'


const ToolbarButton = ({ onClick, isActive, icon: Icon }) => {
    return (
        <button
            onClick={onClick}
            className={cn("text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-muted", isActive && "bg-muted")}>
            <Icon className="w-4 h-4" />
        </button>
    )
}

const FontFamilyButton = () => {
    const { editor } = useEditorStore();
    const currentFont = editor?.getAttributes("textStyle").fontFamily ? editor?.getAttributes("textStyle").fontFamily.split(",")[0].replace(/['"]/g, "") : "Arial";
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-[100px] rounded-sm flex justify-between items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-hidden'>
                    <span className='truncate'>
                        {currentFont}
                    </span>
                    <ChevronDownIcon />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {fonts.map((font, index) => (
                    <button
                        onClick={() => editor?.chain().focus().setMark("textStyle", { fontFamily: font.value }).run()}
                        key={index}
                        className={cn("w-full flex items-center px-2 gap-x-2 py-1 rounded-sm hover:bg-muted/80 ", editor?.getAttributes("textStyle").fontFamily == font.value && "bg-muted/80")}
                        style={{ fontFamily: font.value }}
                    >
                        {font.label}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const FontSizeButton = () => {
    const { editor } = useEditorStore();

    const sizes = Array.from({ length: 21 }, (_, i) => 10 + i);

    const currentSize = editor?.getAttributes("textStyle")?.fontSize?.replace("px", "") || "16";

    const [inputValue, setInputValue] = useState(currentSize);

    useEffect(() => {
        setInputValue(currentSize);
    }, [currentSize]);

    const applyFontSize = (value) => {
        if (!editor) return;
        editor?.chain().focus().setMark("textStyle", { fontSize: `${value}px` }).run();
        setInputValue(value);
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleInputBlur = () => {
        const size = parseInt(inputValue);
        if (inputValue && !isNaN(size)) {
            applyFontSize(size);
        } else {
            setInputValue(currentSize);
        }
    }

    return (
        <div className='h-7 w-[70px] flex rounded-sm justify-between items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
            <input
                type="number"
                min={1}
                max={100}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="max-w-10 text-sm outline-none bg-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
            />
            <DropdownMenu >
                <DropdownMenuTrigger asChild>
                    <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col items-center justify-center">
                    {sizes.map((size, index) => (
                        <button
                            onClick={() => applyFontSize(size)}
                            key={index}
                            className={cn("w-full flex items-center justify-center px-2 gap-x-2 py-1 rounded-sm hover:bg-muted/80 ", `${size}px` == editor?.getAttributes("textStyle").fontSize && "bg-muted/80")}
                        >
                            {size}
                        </button>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu >
        </div>
    )
}

const LineHeightButton = () => {
    const { editor } = useEditorStore();

    const lineHeights = ["1", "2", "3", "4", "5"];

    const currentLineHeight = editor?.getAttributes("textStyle")?.lineHeight || "1.5";

    const [inputValue, setInputValue] = useState(currentLineHeight);

    useEffect(() => {
        setInputValue(currentLineHeight);
    }, [currentLineHeight]);

    const applyLineHeight = (value) => {
        if (!editor) return;
        editor.chain().focus().setMark("textStyle", { lineHeight: value }).run();
        setInputValue(value);
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleInputBlur = () => {
        const size = parseInt(inputValue);
        if (inputValue && !isNaN(size)) {
            applyLineHeight(size);
        } else {
            setInputValue(currentLineHeight);
        }
    }

    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                    <MoveVertical className='size-4' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-center justify-center">
                <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="text-sm outline-none bg-muted rounded-md w-full py-1 px-4"
                    onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
                />
                {lineHeights.map((size, index) => (
                    <button
                        onClick={() => applyLineHeight(size)}
                        key={index}
                        className={cn("w-full flex items-center justify-center px-2 gap-x-2 py-1 rounded-sm hover:bg-muted/80 ", `${size}px` == editor?.getAttributes("textStyle").fontSize && "bg-muted/80")}
                    >
                        {size}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu >
    )
}

const HeadingLevelButton = () => {
    const { editor } = useEditorStore();

    const headings = [
        { label: "Normal text", value: 0 },
        { label: "Heading 1", value: 1 },
        { label: "Heading 2", value: 2 },
        { label: "Heading 3", value: 3 },
        { label: "Heading 4", value: 4 },
        { label: "Heading 5", value: 5 },
    ];

    const fontSizes = {
        0: "16px",
        1: "32px",
        2: "24px",
        3: "20px",
        4: "18px",
        5: "16px",
    };

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if (editor?.isActive("heading", { level })) {
                return `Heading ${level}`;
            }
        }
        return "Normal text";
    };

    const isActive = (value) => value === 0 ? !editor?.isActive("heading") : editor?.isActive("heading", { level: value });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] rounded-sm flex justify-between items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-hidden">
                    <span className="truncate">{getCurrentHeading()}</span>
                    <ChevronDownIcon />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {headings.map((heading) => (
                    <button
                        key={heading.value}
                        onClick={() => {
                            if (heading.value === 0) {
                                editor?.chain().focus().setParagraph().run();
                            } else {
                                editor?.chain().focus().toggleHeading({ level: heading.value }).run();
                            }
                        }}
                        className={cn(
                            "w-full flex items-center px-2 gap-x-2 py-1 rounded-sm hover:bg-muted/80",
                            isActive(heading.value) && "bg-muted/80"
                        )}
                        style={{ fontSize: fontSizes[heading.value] }}
                    >
                        {heading.label}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const CustomTableButton = () => {
    const { editor } = useEditorStore();

    const tableSizes = [
        { rows: 2, cols: 2 },
        { rows: 3, cols: 3 },
        { rows: 4, cols: 4 },
        { rows: 5, cols: 5 },
    ];

    const insertTable = (rows, cols) => {
        editor
            ?.chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: true })
            .run();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-7 w-[120px] flex justify-between items-center rounded-sm hover:bg-muted px-2 text-sm">
                    Insert Table
                    <ChevronDownIcon />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col p-2">
                {tableSizes.map((size, index) => (
                    <button
                        key={index}
                        onClick={() => insertTable(size.rows, size.cols)}
                        className="flex items-center justify-center px-2 py-1 rounded-sm hover:bg-muted/80"
                    >
                        {size.rows} x {size.cols} Table
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const HighlightColorButton = () => {
    const { editor } = useEditorStore();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const defaultTheme = resolvedTheme == "dark" ? "#ffffff" : "#000000";

    const value = editor?.getAttributes("highlight")?.color || defaultTheme;

    const onChange = (color) => {
        editor?.chain().focus().setHighlight({ color: color.hex }).run();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                    <HighlighterIcon className='size-4' />
                    <div className='h-1 w-full rounded-full' style={{ backgroundColor: value }}></div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5">
                <SketchPicker
                    color={value}
                    onChangeComplete={onChange} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const AlignButton = () => {
    const { editor } = useEditorStore();

    const alignments = [
        {
            label: "Align Left",
            value: "left",
            icon: AlignLeftIcon
        },
        {
            label: "Align Center",
            value: "center",
            icon: AlignCenterIcon
        },
        {
            label: "Align Right",
            value: "right",
            icon: AlignRightIcon
        },
        {
            label: "Align Justify",
            value: "justify",
            icon: AlignJustifyIcon
        },
    ]

    const defaultValue = editor?.getAttributes("textAlign") || "left";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                    <AlignLeftIcon className='size-5' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 flex gap-2">
                {alignments.map(({ label, value, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => editor?.chain().focus().setTextAlign(value).run()}
                        className={cn("flex flex-col gap-1 items-center justify-center", defaultValue == value && "bg-muted")}

                    >
                        <Icon className='size-4' />
                        <span className='text-xs'>{label.split(" ")[1]}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const LinkButton = () => {
    const { editor } = useEditorStore();

    const value = editor?.getAttributes("link")?.href || "";

    const [link, setLink] = useState(value);

    const onClick = () => {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: link }).run();
    }

    return (
        <DropdownMenu onOpenChange={(open) => setLink(editor?.getAttributes("link")?.href || "")
        }>
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                    <Link2Icon className='size-4' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 flex items-center justify-center gap-2">
                <input
                    className='p-2 bg-muted rounded-md'
                    placeholder='https://example.com'
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onClick()}
                />
                <Button
                    variant="outline"
                    onClick={onClick}
                    className="h-full cursor-pointer"
                >
                    Link
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const ImageButton = () => {
    const { editor } = useEditorStore();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const onChange = (src) => {
        editor?.chain().focus().setImage({ src }).run();
    }

    const onUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*"
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const imageUrl = URL.createObjectURL(file);
                onChange(imageUrl);
            }
        }
        input.click();
    }

    const handleImageUrlSubmit = () => {
        if (imageUrl.trim() !== "") {
            onChange(imageUrl.trim());
            setImageUrl("");
            setIsDialogOpen(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                        <ImageIcon className='size-4' />
                    </button>

                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={onUpload}>
                        <Upload className='size-4 mr-2' />
                        Upload
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <SearchIcon className='size-4 mr-2' />
                        Paste image url
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image URL</DialogTitle>
                        <DialogDescription>
                            <input
                                className='p-2 bg-muted rounded-md'
                                placeholder='https://example.com'
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleImageUrlSubmit()}
                            />
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={handleImageUrlSubmit}>
                                Insert
                            </Button>
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

const TextColourButton = () => {
    const { editor } = useEditorStore();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const defaultTheme = resolvedTheme == "dark" ? "#ffffff" : "#000000";

    const value = editor?.getAttributes("textStyle")?.color || defaultTheme;

    const onChange = (color) => {
        editor?.chain().focus().setColor(color.hex).run();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='h-7 w-7 flex flex-col rounded-sm justify-center items-center shrink-0 hover:bg-muted px-1.5 text-sm overflow-y-auto'>
                    <span className='text-xs'>A</span>
                    <div className='h-1 w-full rounded-full' style={{ backgroundColor: value }}></div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5">
                <SketchPicker
                    color={value}
                    onChangeComplete={onChange} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const Toolbar = () => {
    const { editor } = useEditorStore();

    const sections = [
        [
            {
                label: "Undo",
                icon: Undo2Icon,
                onClick: () => editor?.commands.undo(),
            },
            {
                label: "Redo",
                icon: Redo2Icon,
                onClick: () => editor?.commands.redo(),
            },
            {
                label: "Print",
                icon: PrinterIcon,
                onClick: () => window.print(),
            },
            {
                label: "Spell Check",
                icon: SpellCheckIcon,
                onClick: () => {
                    const current = editor?.view.dom.getAttribute("spellcheck");
                    editor?.view.dom.setAttribute("spellcheck", current === 'false' ? "true" : "false");
                },
            },
        ],
        [
            {
                label: "Bold",
                icon: BoldIcon,
                isActive: editor?.isActive("bold"),
                onClick: () => editor?.chain().focus().toggleBold().run(),
            },
            {
                label: "Italic",
                icon: ItalicIcon,
                isActive: editor?.isActive("italic"),
                onClick: () => editor?.chain().focus().toggleItalic().run(),
            },
            {
                label: "Underline",
                icon: UnderlineIcon,
                isActive: editor?.isActive("underline"),
                onClick: () => editor?.chain().focus().toggleUnderline().run(),
            },
        ],
        [
            {
                label: "List Todo",
                icon: ListTodoIcon,
                isActive: editor?.isActive("taskList"),
                onClick: () => editor?.chain().focus().toggleTaskList().run(),
            },
            {
                label: "Remove Formatting",
                icon: RemoveFormattingIcon,
                onClick: () => editor?.chain().focus().unsetAllMarks().run(),
            },
        ]
    ]

    return (
        <div className="bg-background px-2.5 py-0.5 rounded-md min-h-[40px] flex items-center gap-0.5  overflow-x-auto">
            {sections[0].map((btn, idx) => (
                <ToolbarButton
                    key={idx}
                    icon={btn.icon}
                    onClick={btn.onClick}
                />
            ))}

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
            {/* Todo font family */}
            <FontFamilyButton />
            <FontSizeButton />

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
            <HeadingLevelButton />

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />

            {sections[2].map((item, index) => (
                <ToolbarButton key={index} {...item} />
            ))}
            <TextColourButton />
            <HighlightColorButton />

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
            {sections[1].map((item, index) => (
                <ToolbarButton key={index} {...item} />
            ))}

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
            <LineHeightButton />
            <AlignButton />

            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
            <LinkButton />
            <ImageButton />
            <CustomTableButton />
            <div className="h-6 w-1 rounded-lg bg-muted-foreground/20 mx-2" />
        </div>
    )
}

export default Toolbar