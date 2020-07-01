using System;

namespace CGF.CameraControl.Provider.Models
{
    public class State
    {
        private int _pan = 0;
        public int Pan { get => _pan; set => _pan = Math.Max(-255, Math.Min(255, value)); }
        private int _tilt = 0;
        public int Tilt { get => _tilt; set => _tilt = Math.Max(-255, Math.Min(255, value)); }
        private int _zoom = 0;
        public int Zoom { get => _zoom; set => _zoom = Math.Max(-8, Math.Min(8, value)); }
        private int _focus = 0;
        public int Focus { get => _focus; set => _focus = Math.Max(-1, Math.Min(1, value)); }

        public override string ToString() => $"{Pan},{Tilt},{Zoom},{Focus}";
        public string ToArduinoString(int version)
        {
            switch (version)
            {
                case 1:
                    return $"{PanTiltToString(Pan)}{PanTiltToString(Tilt)}{ZoomFocusString(Zoom)}{ZoomFocusString(Focus)}";
                default:
                    return "";
            }
        }

        private string PanTiltToString(int value)
        {
            char lowByte = (char)((Math.Abs(value) % 32) + '@');
            char highByte = (char)((Math.Abs(value) / 32) + ((value < 0) ? (1 << 4) : 0) + '@');
            return $"{highByte}{lowByte}";
        }

        private string ZoomFocusString(int value)
        {
            char charValue = (char)(Math.Abs(value) + ((value < 0) ? (1 << 4) : 0) + '@');
            return $"{charValue}";
        }
    }
}
